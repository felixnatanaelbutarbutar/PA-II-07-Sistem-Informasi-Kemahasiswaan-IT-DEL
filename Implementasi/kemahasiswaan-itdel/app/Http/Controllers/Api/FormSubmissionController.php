<?php

namespace App\Http\Controllers;

use App\Models\FormSubmission;
use App\Models\ScholarshipForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FormSubmissionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $form_id = $request->query('form_id');
            $user = Auth::user();
            $submissions = FormSubmission::where('user_id', $user->id)
                ->when($form_id, function ($query) use ($form_id) {
                    return $query->where('form_id', $form_id);
                })
                ->get()
                ->map(function ($submission) {
                    return [
                        'submission_id' => $submission->submission_id,
                        'form_id' => $submission->form_id,
                        'user_id' => $submission->user_id,
                        'data' => $submission->data,
                    ];
                });

            return response()->json(['submissions' => $submissions], 200);
        } catch (\Exception $e) {
            Log::error('Error in FormSubmissionController::index: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Gagal memuat data pengajuan'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'form_id' => 'required|exists:scholarship_forms,form_id',
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'data' => 'required|array',
            ]);

            $form = ScholarshipForm::where('form_id', $validated['form_id'])->firstOrFail();
            if (!$form->settings->accept_responses) {
                return response()->json(['message' => 'Pengajuan formulir saat ini ditutup'], 403);
            }

            $user = Auth::user();
            $submissionId = 'FS' . str_pad(FormSubmission::count() + 1, 3, '0', STR_PAD_LEFT);

            $data = $validated['data'];
            foreach ($data as $key => $value) {
                if ($request->hasFile("data.$key")) {
                    $file = $request->file("data.$key");
                    $data[$key] = $file->store('submission_files', 'public');
                }
            }

            $submission = FormSubmission::create([
                'submission_id' => $submissionId,
                'form_id' => $validated['form_id'],
                'user_id' => $user->id,
                'data' => $data,
            ]);

            return response()->json(['message' => 'Pengajuan berhasil dikirim', 'submission' => $submission], 201);
        } catch (\Exception $e) {
            Log::error('Error in FormSubmissionController::store: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Gagal mengirim pengajuan'], 500);
        }
    }

    public function update(Request $request, $submission_id)
    {
        try {
            $validated = $request->validate([
                'form_id' => 'required|exists:scholarship_forms,form_id',
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'data' => 'required|array',
            ]);

            $form = ScholarshipForm::where('form_id', $validated['form_id'])->firstOrFail();
            if (!$form->settings->accept_responses || !$form->settings->allow_edit) {
                return response()->json(['message' => 'Pengeditan formulir tidak diizinkan'], 403);
            }

            $user = Auth::user();
            $submission = FormSubmission::where('submission_id', $submission_id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $data = $validated['data'];
            foreach ($data as $key => $value) {
                if ($request->hasFile("data.$key")) {
                    // Delete old file if exists
                    if (isset($submission->data[$key])) {
                        Storage::disk('public')->delete($submission->data[$key]);
                    }
                    $file = $request->file("data.$key");
                    $data[$key] = $file->store('submission_files', 'public');
                } elseif (isset($submission->data[$key])) {
                    // Preserve existing file if no new file is uploaded
                    $data[$key] = $submission->data[$key];
                }
            }

            $submission->update(['data' => $data]);

            return response()->json(['message' => 'Pengajuan berhasil diperbarui', 'submission' => $submission], 200);
        } catch (\Exception $e) {
            Log::error('Error in FormSubmissionController::update: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Gagal memperbarui pengajuan'], 500);
        }
    }
}
