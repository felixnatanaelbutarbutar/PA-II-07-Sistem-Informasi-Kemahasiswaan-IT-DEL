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
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mahasiswa') {
                Log::warning('Unauthorized access attempt to index submissions', [
                    'user_id' => Auth::id(),
                    'role' => $user ? $user->role : null,
                ]);
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
            Log::error('Error in API/FormController::index: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to retrieve submissions', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a new form submission.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Starting form submission process', [
                'user_id' => Auth::id(),
                'form_id' => $request->input('form_id'),
                'scholarship_id' => $request->input('scholarship_id'),
            ]);

            $user = Auth::user();
            if (!$user || $user->role !== 'mahasiswa') {
                Log::warning('Unauthorized form submission attempt', [
                    'user_id' => Auth::id(),
                    'role' => $user ? $user->role : null,
                ]);
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Rate limiting: 5 submissions per minute per user
            $key = 'form-submission:' . $user->id;
            if (RateLimiter::tooManyAttempts($key, 5)) {
                $seconds = RateLimiter::availableIn($key);
                Log::warning('Rate limit exceeded for form submission', [
                    'user_id' => $user->id,
                    'seconds_remaining' => $seconds,
                ]);
                return response()->json(['message' => "Terlalu banyak percobaan. Coba lagi dalam $seconds detik."], 429);
            }
            RateLimiter::hit($key, 60);

            Log::info('Validating form data', ['form_id' => $request->input('form_id')]);
            $validatedData = $request->validate([
                'form_id' => 'required|exists:scholarship_forms,form_id',
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'data' => 'required|array',
            ]);

            Log::info('Fetching scholarship form', ['form_id' => $validatedData['form_id']]);
            $form = ScholarshipForm::with(['settings', 'fields'])
                ->where('form_id', $validatedData['form_id'])
                ->where('is_active', true)
                ->firstOrFail();

            // Validate form settings
            if (!$form->settings?->accept_responses) {
                Log::warning('Form does not accept responses', ['form_id' => $form->form_id]);
                return response()->json(['message' => 'Formulir tidak menerima tanggapan saat ini.'], 422);
            }
            if ($form->settings?->submission_start && now()->lessThan($form->settings->submission_start)) {
                Log::warning('Submission period not started', ['form_id' => $form->form_id]);
                return response()->json(['message' => 'Periode pengiriman belum dimulai.'], 422);
            }
            if ($form->settings?->submission_deadline && now()->greaterThan($form->settings->submission_deadline)) {
                Log::warning('Submission deadline passed', ['form_id' => $form->form_id]);
                return response()->json(['message' => 'Batas waktu pengiriman telah berakhir.'], 422);
            }
            if ($form->settings?->max_submissions) {
                $submissionCount = FormSubmission::where('form_id', $form->form_id)->count();
                if ($submissionCount >= $form->settings->max_submissions) {
                    Log::warning('Max submissions reached', [
                        'form_id' => $form->form_id,
                        'submission_count' => $submissionCount,
                    ]);
                    return response()->json(['message' => 'Batas maksimum pengiriman telah tercapai.'], 422);
                }
            }
            if ($form->settings?->one_submission_per_email) {
                $existingSubmission = FormSubmission::where('form_id', $form->form_id)
                    ->where('user_id', $user->id)
                    ->exists();
                if ($existingSubmission && !$form->settings->allow_edit) {
                    Log::warning('Duplicate submission not allowed', [
                        'form_id' => $form->form_id,
                        'user_id' => $user->id,
                    ]);
                    return response()->json(['message' => 'Anda hanya dapat mengirimkan satu tanggapan untuk formulir ini.'], 422);
                }
            }

            // Process form fields
            Log::info('Processing form fields', ['form_id' => $form->form_id]);
            $fields = $form->fields;
            $submittedData = $validatedData['data'];
            $processedData = [];

            foreach ($fields as $index => $field) {
                $fieldKey = "sections." . ($field?->section_title ? array_search($field->section_title, array_unique($fields->pluck('section_title')->toArray())) : 0) . ".fields.{$index}";
                $fieldValue = $submittedData[$fieldKey] ?? null;

                if ($field->is_required && (is_null($fieldValue) || $fieldValue === '')) {
                    Log::warning('Required field missing', [
                        'field_name' => $field->field_name,
                        'field_key' => $fieldKey,
                    ]);
                    return response()->json(['message' => "Kolom '{$field->field_name}' wajib diisi."], 422);
                }

                if ($field->field_type === 'file' && $request->hasFile("data.{$fieldKey}")) {
                    $file = $request->file("data.{$fieldKey}");
                    $allowedMimes = ['pdf', 'jpeg', 'png'];
                    if (!in_array(strtolower($file->getClientOriginalExtension()), $allowedMimes)) {
                        Log::warning('Invalid file type', [
                            'field_name' => $field->field_name,
                            'extension' => $file->getClientOriginalExtension(),
                        ]);
                        return response()->json(['message' => "File untuk '{$field->field_name}' harus berupa PDF, JPEG, atau PNG."], 422);
                    }
                    if ($file->getSize() > 2048 * 1024) {
                        Log::warning('File size too large', [
                            'field_name' => $field->field_name,
                            'size' => $file->getSize(),
                        ]);
                        return response()->json(['message' => "File untuk '{$field->field_name}' tidak boleh melebihi 2MB."], 422);
                    }
                    $path = $file->store('form_submissions', 'public');
                    $processedData[$fieldKey] = $path;
                    Log::info('File uploaded', [
                        'field_name' => $field->field_name,
                        'path' => $path,
                    ]);
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

            Log::info('Saving form submission to database', [
                'user_id' => $user->id,
                'form_id' => $form->form_id,
            ]);
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

                Log::info('Form submission saved successfully', [
                    'submission_id' => $submission->submission_id,
                    'user_id' => $user->id,
                    'form_id' => $form->form_id,
                ]);

                return response()->json([
                    'message' => 'Pengajuan formulir berhasil dikirim.',
                    'submission' => [
                        'submission_id' => $submission->submission_id,
                        'form_id' => $submission->form_id,
                        'submitted_at' => $submission->submitted_at->toDateTimeString(),
                    ],
                ], 201);
            });
        } catch (ValidationException $e) {
            Log::error('Validation error in API/FormController::store: ' . json_encode($e->errors()), [
                'user_id' => Auth::id(),
                'request_data' => $request->except(['data.*.file']),
            ]);
            return response()->json(['message' => 'Gagal mengirim formulir.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error in API/FormController::store: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['data.*.file']),
            ]);
            return response()->json(['message' => 'Gagal mengirim formulir.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display a specific form submission.
     */
    public function show($submission_id)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mahasiswa') {
                Log::warning('Unauthorized access attempt to view submission', [
                    'user_id' => Auth::id(),
                    'submission_id' => $submission_id,
                ]);
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
            Log::error('Error in API/FormController::show: ' . $e->getMessage(), [
                'submission_id' => $submission_id,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to retrieve submission', 'error' => $e->getMessage()], 404);
        }
    }

    /**
     * Update an existing form submission.
     */
    public function update(Request $request, $submission_id)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mahasiswa') {
                Log::warning('Unauthorized attempt to update submission', [
                    'user_id' => Auth::id(),
                    'submission_id' => $submission_id,
                ]);
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Rate limiting: 5 updates per minute per user
            $key = 'form-update:' . $user->id;
            if (RateLimiter::tooManyAttempts($key, 5)) {
                $seconds = RateLimiter::availableIn($key);
                Log::warning('Rate limit exceeded for form update', [
                    'user_id' => $user->id,
                    'seconds_remaining' => $seconds,
                ]);
                return response()->json(['message' => "Terlalu banyak percobaan. Coba lagi dalam $seconds detik."], 429);
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
                Log::warning('Form edit not allowed', [
                    'form_id' => $form->form_id,
                    'user_id' => $user->id,
                ]);
                return response()->json(['message' => 'Pengeditan tidak diizinkan untuk formulir ini.'], 422);
            }

            $validatedData = $request->validate(['data' => 'required|array']);
            $fields = $form->fields;
            $submittedData = $validatedData['data'];
            $processedData = $submission->data;

            foreach ($fields as $index => $field) {
                $fieldKey = "sections." . ($field?->section_title ? array_search($field->section_title, array_unique($fields->pluck('section_title')->toArray())) : 0) . ".fields.{$index}";
                $fieldValue = $submittedData[$fieldKey] ?? null;
                if ($field->is_required && (is_null($fieldValue) || $fieldValue === '')) {
                    Log::warning('Required field missing on update', [
                        'field_name' => $field->field_name,
                        'field_key' => $fieldKey,
                    ]);
                    return response()->json(['message' => "Kolom '{$field->field_name}' wajib diisi."], 422);
                }

                if ($field->field_type === 'file' && $request->hasFile("data.{$fieldKey}")) {
                    $file = $request->file("data.{$fieldKey}");
                    $allowedMimes = ['pdf', 'jpeg', 'png'];
                    if (!in_array(strtolower($file->getClientOriginalExtension()), $allowedMimes)) {
                        Log::warning('Invalid file type on update', [
                            'field_name' => $field->field_name,
                            'extension' => $file->getClientOriginalExtension(),
                        ]);
                        return response()->json(['message' => "File untuk '{$field->field_name}' harus berupa PDF, JPEG, atau PNG."], 422);
                    }
                    if ($file->getSize() > 2048 * 1024) {
                        Log::warning('File size too large on update', [
                            'field_name' => $field->field_name,
                            'size' => $file->getSize(),
                        ]);
                        return response()->json(['message' => "File untuk '{$field->field_name}' tidak boleh melebihi 2MB."], 422);
                    }
                    if (isset($processedData[$fieldKey]) && Storage::disk('public')->exists($processedData[$fieldKey])) {
                        Storage::disk('public')->delete($processedData[$fieldKey]);
                    }
                    $path = $file->store('form_submissions', 'public');
                    $processedData[$fieldKey] = $path;
                    Log::info('File updated', [
                        'field_name' => $field->field_name,
                        'path' => $path,
                    ]);
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

            Log::info('Updating form submission in database', [
                'submission_id' => $submission->submission_id,
                'user_id' => $user->id,
            ]);
            return DB::transaction(function () use ($submission, $processedData, $personalData) {
                $submission->update([
                    'data' => $processedData,
                    'personal_data' => !empty($personalData) ? $personalData : null,
                    'updated_at' => now(),
                ]);

                Log::info('Form submission updated successfully', [
                    'submission_id' => $submission->submission_id,
                    'user_id' => $submission->user_id,
                ]);

                return response()->json([
                    'message' => 'Pengajuan formulir berhasil diperbarui.',
                    'submission' => [
                        'submission_id' => $submission->submission_id,
                        'form_id' => $submission->form_id,
                        'submitted_at' => $submission->submitted_at->toDateTimeString(),
                    ],
                ], 200);
            });
        } catch (ValidationException $e) {
            Log::error('Validation error in API/FormController::update: ' . json_encode($e->errors()), [
                'submission_id' => $submission_id,
                'user_id' => Auth::id(),
                'request_data' => $request->except(['data.*.file']),
            ]);
            return response()->json(['message' => 'Gagal memperbarui formulir.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error in API/FormController::update: ' . $e->getMessage(), [
                'submission_id' => $submission_id,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['data.*.file']),
            ]);
            return response()->json(['message' => 'Gagal memperbarui formulir.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a form submission.
     */
    public function destroy($submission_id)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'mahasiswa') {
                Log::warning('Unauthorized attempt to delete submission', [
                    'user_id' => Auth::id(),
                    'submission_id' => $submission_id,
                ]);
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $submission = FormSubmission::where('submission_id', $submission_id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            Log::info('Deleting form submission', [
                'submission_id' => $submission_id,
                'user_id' => $user->id,
            ]);
            return DB::transaction(function () use ($submission) {
                if ($submission->data) {
                    foreach ($submission->data as $fieldKey => $value) {
                        if (is_string($value) && strpos($value, 'form_submissions/') === 0 && Storage::disk('public')->exists($value)) {
                            Storage::disk('public')->delete($value);
                            Log::info('Deleted file', ['path' => $value]);
                        }
                    }
                }

                $submission->delete();
                Log::info('Form submission deleted successfully', [
                    'submission_id' => $submission->submission_id,
                    'user_id' => $submission->user_id,
                ]);

                return response()->json(['message' => 'Pengajuan formulir berhasil dihapus.'], 200);
            });
        } catch (\Exception $e) {
            Log::error('Error in API/FormController::destroy: ' . $e->getMessage(), [
                'submission_id' => $submission_id,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Gagal menghapus pengajuan.', 'error' => $e->getMessage()], 500);
        }
    }
}
