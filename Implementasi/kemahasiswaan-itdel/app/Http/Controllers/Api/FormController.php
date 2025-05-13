<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\FormField;
use App\Models\FormSetting;
use App\Models\FormSubmission;
use App\Models\ScholarshipForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class FormController extends Controller
{
    /**
     * Generate a unique submission ID (e.g., FSUB001).
     */
    private function generateId(string $prefix, string $column, string $table): string
    {
        $lastRecord = DB::table($table)->orderBy($column, 'desc')->first();
        $lastNumber = $lastRecord ? (int) substr($lastRecord->$column, strlen($prefix)) : 0;
        return $prefix . str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Display a list of the user's form submissions.
     */
    public function submissions(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mahasiswa') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $formId = $request->query('form_id');
            $query = FormSubmission::where('user_id', $user->id)
                ->with(['form' => fn($q) => $q->select('form_id', 'form_name', 'scholarship_id'),
                        'form.scholarship' => fn($q) => $q->select('scholarship_id', 'name')]);

            if ($formId) {
                $query->where('form_id', $formId);
            }

            $submissions = $query->orderBy('submitted_at', 'desc')->get()->map(fn($submission) => [
                'submission_id' => $submission->submission_id,
                'form_id' => $submission->form_id,
                'form_name' => $submission->form?->form_name ?? '-',
                'scholarship_name' => $submission->form?->scholarship?->name ?? '-',
                'submitted_at' => $submission->submitted_at->toDateTimeString(),
                'data' => $submission->data,
                'personal_data' => $submission->personal_data,
            ]);

            return response()->json([
                'message' => 'Submissions retrieved successfully',
                'submissions' => $submissions,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in API/FormController::submissions: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Failed to retrieve submissions', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a new form submission.
     */
    public function storeSubmission(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mahasiswa') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Rate limiting: 5 submissions per minute per user
            $key = 'form-submission:' . $user->id;
            if (RateLimiter::tooManyAttempts($key, 5)) {
                $seconds = RateLimiter::availableIn($key);
                return response()->json(['message' => "Too many attempts. Try again in $seconds seconds."], 429);
            }
            RateLimiter::hit($key, 60);

            $validatedData = $request->validate([
                'form_id' => 'required|exists:scholarship_forms,form_id',
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'data' => 'required|array',
            ]);

            $form = ScholarshipForm::with(['settings', 'fields'])
                ->where('form_id', $validatedData['form_id'])
                ->where('is_active', true)
                ->firstOrFail();

            // Validate form settings
            if (!$form->settings?->accept_responses) {
                return response()->json(['message' => 'Form is not accepting responses'], 422);
            }
            if ($form->settings?->submission_start && now()->lessThan($form->settings->submission_start)) {
                return response()->json(['message' => 'Submission period has not started'], 422);
            }
            if ($form->settings?->submission_deadline && now()->greaterThan($form->settings->submission_deadline)) {
                return response()->json(['message' => 'Submission deadline has passed'], 422);
            }
            if ($form->settings?->max_submissions) {
                $submissionCount = FormSubmission::where('form_id', $form->form_id)->count();
                if ($submissionCount >= $form->settings->max_submissions) {
                    return response()->json(['message' => 'Maximum submissions reached'], 422);
                }
            }
            if ($form->settings?->one_submission_per_email) {
                $existingSubmission = FormSubmission::where('form_id', $form->form_id)
                    ->where('user_id', $user->id)
                    ->exists();
                if ($existingSubmission) {
                    return response()->json(['message' => 'Only one submission allowed per user'], 422);
                }
            }

            // Process form fields
            $fields = $form->fields;
            $submittedData = $validatedData['data'];
            $processedData = [];

            foreach ($fields as $field) {
                $fieldKey = "sections.{$field->section_index}.fields.{$field->field_index}";
                $fieldValue = $submittedData[$fieldKey] ?? null;

                if ($field->is_required && (is_null($fieldValue) || $fieldValue === '')) {
                    return response()->json(['message' => "Field '{$field->field_name}' is required"], 422);
                }

                if ($field->field_type === 'file' && $request->hasFile("data.{$fieldKey}")) {
                    $file = $request->file("data.{$fieldKey}");
                    $allowedMimes = ['pdf', 'jpeg', 'png'];
                    if (!in_array($file->getClientOriginalExtension(), $allowedMimes)) {
                        return response()->json(['message' => "File for '{$field->field_name}' must be PDF, JPEG, or PNG"], 422);
                    }
                    if ($file->getSize() > 2048 * 1024) {
                        return response()->json(['message' => "File for '{$field->field_name}' must not exceed 2MB"], 422);
                    }
                    $path = $file->store('form_submissions', 'public');
                    $processedData[$fieldKey] = $path;
                } else {
                    $processedData[$fieldKey] = $fieldValue;
                }
            }

            // Collect personal data
            $personalData = [
                'name' => $user->name,
                'nim' => $user->nim,
                'asrama' => $user->asrama,
                'prodi' => $user->prodi,
                'fakultas' => $user->fakultas,
                'angkatan' => $user->angkatan,
                'email' => $user->email,
            ];

            return DB::transaction(function () use ($form, $user, $processedData, $personalData, $validatedData) {
                $submissionId = $this->generateId('FSUB', 'submission_id', 'form_submissions');
                $submission = FormSubmission::create([
                    'submission_id' => $submissionId,
                    'form_id' => $form->form_id,
                    'user_id' => $user->id,
                    'data' => $processedData,
                    'personal_data' => !empty($personalData) ? $personalData : null,
                    'submitted_at' => now(),
                ]);

                return response()->json([
                    'message' => 'Form submitted successfully',
                    'submission' => [
                        'submission_id' => $submission->submission_id,
                        'form_id' => $submission->form_id,
                        'submitted_at' => $submission->submitted_at->toDateTimeString(),
                    ],
                ], 201);
            });
        } catch (ValidationException $e) {
            Log::error('Validation error in API/FormController::storeSubmission: ' . json_encode($e->errors()), [
                'user_id' => Auth::id(),
                'request_data' => $request->except(['data.*.file']),
            ]);
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error in API/FormController::storeSubmission: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to submit form', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display a specific form submission.
     */
    public function showSubmission($submission_id)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mahasiswa') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $submission = FormSubmission::where('submission_id', $submission_id)
                ->where('user_id', $user->id)
                ->with(['form' => fn($q) => $q->select('form_id', 'form_name', 'scholarship_id'),
                        'form.scholarship' => fn($q) => $q->select('scholarship_id', 'name'),
                        'form.fields'])
                ->firstOrFail();

            $formData = [
                'submission_id' => $submission->submission_id,
                'form_id' => $submission->form_id,
                'form_name' => $submission->form?->form_name ?? '-',
                'scholarship_name' => $submission->form?->scholarship?->name ?? '-',
                'submitted_at' => $submission->submitted_at->toDateTimeString(),
                'data' => collect($submission->data)->mapWithKeys(function ($value, $fieldKey) use ($submission) {
                    $field = $submission->form->fields->firstWhere('field_key', $fieldKey);
                    $fieldName = $field ? $field->field_name : $fieldKey;
                    if (is_string($value) && strpos($value, 'form_submissions/') === 0) {
                        $value = Storage::url($value);
                    }
                    return [$fieldName => $value];
                })->toArray(),
                'personal_data' => $submission->personal_data,
            ];

            return response()->json([
                'message' => 'Submission retrieved successfully',
                'submission' => $formData,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in API/FormController::showSubmission: ' . $e->getMessage(), [
                'submission_id' => $submission_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to retrieve submission', 'error' => $e->getMessage()], 404);
        }
    }

    /**
     * Update an existing form submission.
     */
    public function updateSubmission(Request $request, $submission_id)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mahasiswa') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Rate limiting: 5 updates per minute per user
            $key = 'form-update:' . $user->id;
            if (RateLimiter::tooManyAttempts($key, 5)) {
                $seconds = RateLimiter::availableIn($key);
                return response()->json(['message' => "Too many attempts. Try again in $seconds seconds."], 429);
            }
            RateLimiter::hit($key, 60);

            $submission = FormSubmission::where('submission_id', $submission_id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $form = ScholarshipForm::with(['settings', 'fields'])
                ->where('form_id', $submission->form_id)
                ->where('is_active', true)
                ->firstOrFail();

            if (!$form->settings?->allow_edit) {
                return response()->json(['message' => 'Editing is not allowed for this form'], 422);
            }

            $validatedData = $request->validate(['data' => 'required|array']);
            $fields = $form->fields;
            $submittedData = $validatedData['data'];
            $processedData = $submission->data;

            foreach ($fields as $field) {
                $fieldKey = "sections.{$field->section_index}.fields.{$field->field_index}";
                $fieldValue = $submittedData[$fieldKey] ?? null;
                if ($field->is_required && (is_null($fieldValue) || $fieldValue === '')) {
                    return response()->json(['message' => "Field '{$field->field_name}' is required"], 422);
                }

                if ($field->field_type === 'file' && $request->hasFile("data.{$fieldKey}")) {
                    $file = $request->file("data.{$fieldKey}");
                    $allowedMimes = ['pdf', 'jpeg', 'png'];
                    if (!in_array($file->getClientOriginalExtension(), $allowedMimes)) {
                        return response()->json(['message' => "File for '{$field->field_name}' must be PDF, JPEG, or PNG"], 422);
                    }
                    if ($file->getSize() > 2048 * 1024) {
                        return response()->json(['message' => "File for '{$field->field_name}' must not exceed 2MB"], 422);
                    }
                    if (isset($processedData[$fieldKey]) && Storage::disk('public')->exists($processedData[$fieldKey])) {
                        Storage::disk('public')->delete($processedData[$fieldKey]);
                    }
                    $path = $file->store('form_submissions', 'public');
                    $processedData[$fieldKey] = $path;
                } elseif (array_key_exists($fieldKey, $submittedData)) {
                    $processedData[$fieldKey] = $fieldValue;
                }
            }

            $personalData = $submission->personal_data ?? [];
            $personalData = array_merge($personalData, [
                'name' => $user->name,
                'nim' => $user->nim,
                'asrama' => $user->asrama,
                'prodi' => $user->prodi,
                'fakultas' => $user->fakultas,
                'angkatan' => $user->angkatan,
                'email' => $user->email,
            ]);

            return DB::transaction(function () use ($submission, $processedData, $personalData) {
                $submission->update([
                    'data' => $processedData,
                    'personal_data' => !empty($personalData) ? $personalData : null,
                    'updated_at' => now(),
                ]);

                return response()->json([
                    'message' => 'Submission updated successfully',
                    'submission' => [
                        'submission_id' => $submission->submission_id,
                        'form_id' => $submission->form_id,
                        'submitted_at' => $submission->submitted_at->toDateTimeString(),
                    ],
                ], 200);
            });
        } catch (ValidationException $e) {
            Log::error('Validation error in API/FormController::updateSubmission: ' . json_encode($e->errors()), [
                'submission_id' => $submission_id,
                'user_id' => Auth::id(),
            ]);
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error in API/FormController::updateSubmission: ' . $e->getMessage(), [
                'submission_id' => $submission_id,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to update submission', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a form submission.
     */
    public function destroySubmission($submission_id)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mahasiswa') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $submission = FormSubmission::where('submission_id', $submission_id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            return DB::transaction(function () use ($submission) {
                if ($submission->data) {
                    foreach ($submission->data as $fieldKey => $value) {
                        if (is_string($value) && strpos($value, 'form_submissions/') === 0 && Storage::disk('public')->exists($value)) {
                            Storage::disk('public')->delete($value);
                        }
                    }
                }

                $submission->delete();
                return response()->json(['message' => 'Submission deleted successfully'], 200);
            });
        } catch (\Exception $e) {
            Log::error('Error in API/FormController::destroySubmission: ' . $e->getMessage(), [
                'submission_id' => $submission_id,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to delete submission', 'error' => $e->getMessage()], 500);
        }
    }
}
