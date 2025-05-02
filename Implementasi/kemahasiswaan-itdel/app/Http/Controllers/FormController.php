<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use App\Models\ScholarshipForm;
use App\Models\FormField;
use App\Models\FormSetting;
use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Helpers\RoleHelper;

class FormController extends Controller
{
    // Helper method to generate custom IDs
    private function generateId(string $prefix, string $column, string $table): string
    {
        $lastRecord = DB::table($table)->orderBy($column, 'desc')->first();
        $lastNumber = $lastRecord ? (int) substr($lastRecord->$column, strlen($prefix)) : 0;
        return $prefix . str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
    }

    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);

            // Get search term and status filter from request
            $searchTerm = $request->input('search', '');
            $statusFilter = $request->input('status', 'all');

            // Build the query
            $query = ScholarshipForm::with([
                'scholarship:scholarship_id,name',
                'creator:id,name',
                'settings:setting_id,form_id,submission_deadline,created_at'
            ]);

            // Apply status filter
            if ($statusFilter === 'active') {
                $query->where('is_active', true);
            } elseif ($statusFilter === 'inactive') {
                $query->where('is_active', false);
            }

            // Apply search filter (case-insensitive)
            if (!empty($searchTerm)) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->whereRaw('LOWER(form_name) LIKE ?', ['%' . strtolower($searchTerm) . '%'])
                      ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($searchTerm) . '%'])
                      ->orWhereHas('scholarship', function ($q) use ($searchTerm) {
                          $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($searchTerm) . '%']);
                      })
                      ->orWhereHas('creator', function ($q) use ($searchTerm) {
                          $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($searchTerm) . '%']);
                      });
                });
            }

            // Fetch and map forms
            $forms = $query->get()->map(function ($form) {
                return [
                    'form_id' => $form->form_id,
                    'form_name' => $form->form_name,
                    'description' => $form->description,
                    'scholarship_name' => $form->scholarship?->name ?? '-',
                    'created_by' => $form->creator?->name ?? '-',
                    'open_date' => $form->settings?->created_at?->toDateString(),
                    'close_date' => $form->settings?->submission_deadline?->toDateString(),
                    'is_active' => $form->is_active,
                    'status' => $form->is_active ? 'Aktif' : 'Non-Aktif',
                ];
            });

            return Inertia::render('Admin/Form/index', [
                'auth' => ['user' => $user],
                'userRole' => $role,
                'permissions' => RoleHelper::getRolePermissions($role),
                'forms' => $forms,
                'scholarships' => Scholarship::select('scholarship_id', 'name')->get(),
                'menu' => RoleHelper::getNavigationMenu($role),
                'flash' => session()->only(['success', 'error']),
                'filters' => [
                    'search' => $searchTerm,
                    'status' => $statusFilter,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::index: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Gagal memuat daftar formulir: ' . $e->getMessage());
        }
    }

    // Display form creation page
    public function create()
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);

            return Inertia::render('Admin/Form/add', [
                'auth' => ['user' => $user],
                'userRole' => $role,
                'permissions' => RoleHelper::getRolePermissions($role),
                'scholarships' => Scholarship::select('scholarship_id', 'name')->get(),
                'menu' => RoleHelper::getNavigationMenu($role),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::create: ' . $e->getMessage());
            return redirect()->route('form.index')->with('error', 'Gagal memuat halaman tambah formulir.');
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'form_name' => 'required|string|max:100',
                'description' => 'nullable|string',
                'is_active' => 'nullable|boolean', // Allow nullable
                'created_by' => 'required|exists:users,id',
                'sections' => 'required|array|min:1', // Ensure at least one section
                'sections.*.title' => 'nullable|string|max:100',
                'sections.*.fields' => 'required|array|min:1', // Ensure at least one field per section
                'sections.*.fields.*.field_name' => 'required|string|max:100',
                'sections.*.fields.*.field_type' => 'required|in:text,number,date,dropdown,file,quill',
                'sections.*.fields.*.is_required' => 'required|boolean',
                'sections.*.fields.*.order' => 'required|integer|min:1', // Accept any positive integer
                'sections.*.fields.*.options' => 'nullable|string',
                'sections.*.fields.*.file' => 'nullable|file|mimes:pdf,doc,docx,jpeg,png|max:2048', // Explicit mime types
                'sections.*.fields.*.is_active' => 'nullable|boolean',
            ]);

            return DB::transaction(function () use ($request, $validatedData) {
                $formId = $this->generateId('SF', 'form_id', 'scholarship_forms');

                $form = ScholarshipForm::create([
                    'form_id' => $formId,
                    'scholarship_id' => $validatedData['scholarship_id'],
                    'form_name' => $validatedData['form_name'],
                    'description' => $validatedData['description'],
                    'is_active' => $validatedData['is_active'] ?? true, // Default to true
                    'created_by' => $validatedData['created_by'],
                ]);

                $settingId = $this->generateId('FS', 'setting_id', 'form_settings');
                FormSetting::create([
                    'setting_id' => $settingId,
                    'form_id' => $formId,
                    'accept_responses' => true,
                    'one_submission_per_email' => false,
                    'allow_edit' => true,
                    'submission_deadline' => null,
                    'max_submissions' => null,
                    'response_notification' => false,
                    'is_active' => true,
                    'created_by' => $validatedData['created_by'],
                ]);

                $globalOrder = 1;
                foreach ($validatedData['sections'] as $sectionIndex => $section) {
                    foreach ($section['fields'] as $fieldIndex => $fieldData) {
                        $fieldId = $this->generateId('FF', 'field_id', 'form_fields');
                        $fieldAttributes = [
                            'field_id' => $fieldId,
                            'form_id' => $formId,
                            'section_title' => $section['title'] ?? null,
                            'field_name' => $fieldData['field_name'],
                            'field_type' => $fieldData['field_type'],
                            'is_required' => $fieldData['is_required'],
                            'options' => $fieldData['options'] ?? null,
                            'order' => str_pad($fieldData['order'], 3, '0', STR_PAD_LEFT), // Pad order to three digits
                            'file_path' => null,
                            'is_active' => $fieldData['is_active'] ?? true,
                            'created_by' => $validatedData['created_by'],
                        ];

                        if ($fieldData['field_type'] === 'file' && $request->hasFile("sections.$sectionIndex.fields.$fieldIndex.file")) {
                            $file = $request->file("sections.$sectionIndex.fields.$fieldIndex.file");
                            $fieldAttributes['file_path'] = $file->store('form_files', 'public');
                        }

                        FormField::create($fieldAttributes);
                        $globalOrder++;
                    }
                }

                return redirect()->route('admin.form.index')->with('success', 'Formulir berhasil ditambahkan.');
            });
        } catch (\Exception $e) {
            Log::error('Error in FormController::store: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Gagal menambahkan formulir: ' . $e->getMessage())->withInput();
        }
    }

    // Display form edit page
    public function edit(ScholarshipForm $form)
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);

            $form->load(['scholarship:scholarship_id,name', 'fields']);
            $sections = $form->fields->groupBy('section_title')->map(function ($fields, $sectionTitle) {
                return [
                    'title' => $sectionTitle ?? '',
                    'fields' => $fields->map(function ($field) {
                        return [
                            'field_id' => $field->field_id,
                            'field_name' => $field->field_name,
                            'field_type' => $field->field_type,
                            'is_required' => (bool) $field->is_required,
                            'options' => $field->options,
                            'order' => str_pad($field->order, 3, '0', STR_PAD_LEFT),
                            'file_path' => $field->file_path ? Storage::url($field->file_path) : null,
                            'is_active' => $field->is_active,
                        ];
                    })->sortBy('order')->values()->toArray(),
                ];
            })->values();

            return Inertia::render('Admin/Form/edit', [
                'auth' => ['user' => $user],
                'userRole' => $role,
                'permissions' => RoleHelper::getRolePermissions($role),
                'form' => [
                    'form_id' => $form->form_id,
                    'scholarship_id' => $form->scholarship_id,
                    'form_name' => $form->form_name,
                    'description' => $form->description,
                    'is_active' => $form->is_active,
                    'status' => $form->is_active ? 'Aktif' : 'Non-Aktif',
                    'sections' => $sections,
                ],
                'scholarships' => Scholarship::select('scholarship_id', 'name')->get(),
                'menu' => RoleHelper::getNavigationMenu($role),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::edit: ' . $e->getMessage());
            return redirect()->route('form.index')->with('error', 'Gagal memuat halaman edit formulir.');
        }
    }

    // Update form
    public function update(Request $request, ScholarshipForm $form)
    {
        try {
            $validatedData = $request->validate([
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'form_name' => 'required|string|max:100',
                'description' => 'nullable|string',
                'is_active' => 'boolean',
                'sections' => 'required|array',
                'sections.*.title' => 'nullable|string|max:100',
                'sections.*.fields' => 'required|array',
                'sections.*.fields.*.field_name' => 'required|string|max:100',
                'sections.*.fields.*.field_type' => 'required|in:text,number,date,dropdown,file,quill',
                'sections.*.fields.*.is_required' => 'required|boolean',
                'sections.*.fields.*.order' => 'required|regex:/^\d{3}$/',
                'sections.*.fields.*.options' => 'nullable|string',
                'sections.*.fields.*.file' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
                'sections.*.fields.*.field_id' => 'nullable|string|exists:form_fields,field_id',
                'sections.*.fields.*.is_active' => 'boolean',
            ]);

            return DB::transaction(function () use ($request, $validatedData, $form) {
                $user = Auth::user();

                $form->update([
                    'scholarship_id' => $validatedData['scholarship_id'],
                    'form_name' => $validatedData['form_name'],
                    'description' => $validatedData['description'],
                    'is_active' => $validatedData['is_active'] ?? $form->is_active,
                    'updated_by' => $user->id,
                ]);

                $existingFields = FormField::where('form_id', $form->form_id)->get();
                $existingFieldIds = $existingFields->pluck('field_id')->toArray();
                $submittedFieldIds = collect($validatedData['sections'])
                    ->flatMap(fn($section) => $section['fields'])
                    ->pluck('field_id')
                    ->filter()
                    ->toArray();

                foreach (array_diff($existingFieldIds, $submittedFieldIds) as $fieldId) {
                    $field = $existingFields->firstWhere('field_id', $fieldId);
                    if ($field?->file_path) {
                        Storage::disk('public')->delete($field->file_path);
                    }
                    FormField::where('field_id', $fieldId)->delete();
                }

                $globalOrder = 1;
                foreach ($validatedData['sections'] as $sectionIndex => $section) {
                    foreach ($section['fields'] as $fieldIndex => $fieldData) {
                        $fieldId = $fieldData['field_id'] ?? null;
                        $fieldAttributes = [
                            'form_id' => $form->form_id,
                            'section_title' => $section['title'] ?? null,
                            'field_name' => $fieldData['field_name'],
                            'field_type' => $fieldData['field_type'],
                            'is_required' => $fieldData['is_required'],
                            'options' => $fieldData['options'] ?? null,
                            'order' => str_pad($globalOrder, 3, '0', STR_PAD_LEFT),
                            'is_active' => $fieldData['is_active'] ?? true,
                        ];

                        if ($fieldData['field_type'] === 'file' && $request->hasFile("sections.$sectionIndex.fields.$fieldIndex.file")) {
                            if ($fieldId && ($oldField = $existingFields->firstWhere('field_id', $fieldId)) && $oldField->file_path) {
                                Storage::disk('public')->delete($oldField->file_path);
                            }
                            $file = $request->file("sections.$sectionIndex.fields.$fieldIndex.file");
                            $fieldAttributes['file_path'] = $file->store('form_files', 'public');
                        } elseif ($fieldId && ($oldField = $existingFields->firstWhere('field_id', $fieldId)) && $oldField->file_path) {
                            $fieldAttributes['file_path'] = $oldField->file_path;
                        } else {
                            $fieldAttributes['file_path'] = null;
                        }

                        if ($fieldId && in_array($fieldId, $existingFieldIds)) {
                            FormField::where('field_id', $fieldId)->update(array_merge($fieldAttributes, [
                                'updated_by' => $user->id,
                            ]));
                        } else {
                            $fieldId = $this->generateId('FF', 'field_id', 'form_fields');
                            FormField::create(array_merge($fieldAttributes, [
                                'field_id' => $fieldId,
                                'created_by' => $user->id,
                                'updated_by' => $user->id,
                            ]));
                        }
                        $globalOrder++;
                    }
                }

                return redirect()->route('form.index')->with('success', 'Formulir berhasil diperbarui.');
            });
        } catch (\Exception $e) {
            Log::error('Error in FormController::update: ' . $e->getMessage(), [
                'form_id' => $form->form_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Gagal memperbarui formulir: ' . $e->getMessage());
        }
    }

    // Delete form
    public function destroy(ScholarshipForm $form)
    {
        try {
            return DB::transaction(function () use ($form) {
                $fields = FormField::where('form_id', $form->form_id)->get();
                foreach ($fields as $field) {
                    if ($field->file_path) {
                        Storage::disk('public')->delete($field->file_path);
                    }
                    $field->delete();
                }

                FormSetting::where('form_id', $form->form_id)->delete();
                $form->delete();

                return redirect()->route('form.index')->with('success', 'Formulir berhasil dihapus.');
            });
        } catch (\Exception $e) {
            Log::error('Error in FormController::destroy: ' . $e->getMessage(), [
                'form_id' => $form->form_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Gagal menghapus formulir: ' . $e->getMessage());
        }
    }

    // Toggle active/non-active status
    public function toggleActive(ScholarshipForm $form)
    {
        try {
            $form->update([
                'is_active' => !$form->is_active,
                'updated_by' => Auth::id(),
            ]);

            return redirect()->route('form.index')->with('success', $form->is_active ? 'Formulir berhasil diaktifkan.' : 'Formulir berhasil dinonaktifkan.');
        } catch (\Exception $e) {
            Log::error('Error in FormController::toggleActive: ' . $e->getMessage(), [
                'form_id' => $form->form_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Gagal mengubah status formulir: ' . $e->getMessage());
        }
    }

    // Display form settings page
    public function settings(ScholarshipForm $form)
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);
            $settings = FormSetting::where('form_id', $form->form_id)->first();

            return Inertia::render('Admin/Form/settings', [
                'auth' => ['user' => $user],
                'userRole' => $role,
                'permissions' => RoleHelper::getRolePermissions($role),
                'form' => $form,
                'settings' => $settings ?? [
                    'form_id' => $form->form_id,
                    'accept_responses' => true,
                    'one_submission_per_email' => false,
                    'allow_edit' => true,
                    'submission_deadline' => null,
                    'max_submissions' => null,
                    'response_notification' => false,
                    'is_active' => true,
                ],
                'menu' => RoleHelper::getNavigationMenu($role),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::settings: ' . $e->getMessage());
            return redirect()->route('form.index')->with('error', 'Gagal memuat halaman pengaturan formulir.');
        }
    }

    // Update form settings
    public function updateSettings(Request $request, ScholarshipForm $form)
    {
        try {
            $validatedData = $request->validate([
                'accept_responses' => 'required|boolean',
                'one_submission_per_email' => 'required|boolean',
                'allow_edit' => 'required|boolean',
                'response_notification' => 'required|boolean',
                'submission_deadline' => 'nullable|date|after:now',
                'max_submissions' => 'nullable|integer|min:1',
                'is_active' => 'boolean',
            ]);

            return DB::transaction(function () use ($request, $validatedData, $form) {
                $user = Auth::user();
                $settings = FormSetting::where('form_id', $form->form_id)->first();

                $attributes = [
                    'accept_responses' => $validatedData['accept_responses'],
                    'one_submission_per_email' => $validatedData['one_submission_per_email'],
                    'allow_edit' => $validatedData['allow_edit'],
                    'submission_deadline' => $validatedData['submission_deadline'],
                    'max_submissions' => $validatedData['max_submissions'],
                    'response_notification' => $validatedData['response_notification'],
                    'is_active' => $validatedData['is_active'] ?? true,
                    'updated_by' => $user->id,
                ];

                if (!$settings) {
                    $settingId = $this->generateId('FS', 'setting_id', 'form_settings');
                    FormSetting::create(array_merge($attributes, [
                        'setting_id' => $settingId,
                        'form_id' => $form->form_id,
                        'created_by' => $user->id,
                    ]));
                } else {
                    $settings->update($attributes);
                }

                return redirect()->route('form.index')->with('success', 'Pengaturan formulir berhasil diperbarui.');
            });
        } catch (\Exception $e) {
            Log::error('Error in FormController::updateSettings: ' . $e->getMessage(), [
                'form_id' => $form->form_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Gagal memperbarui pengaturan formulir: ' . $e->getMessage());
        }
    }

    // Guest index for scholarships
    public function guestIndex()
    {
        try {
            $scholarships = Scholarship::with('category')->get();
            return Inertia::render('ScholarshipIndex', [
                'scholarships' => $scholarships,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::guestIndex: ' . $e->getMessage());
            return redirect()->route('guest.scholarship.index')->with('error', 'Gagal memuat daftar beasiswa.');
        }
    }

    // Guest show scholarship details
    public function guestShow($scholarship_id)
    {
        try {
            $scholarship = Scholarship::with('category')
                ->where('scholarship_id', $scholarship_id)
                ->firstOrFail();

            $form = ScholarshipForm::with(['fields', 'settings'])
                ->where('scholarship_id', $scholarship_id)
                ->where('is_active', true)
                ->first();

            $formData = $form ? [
                'form_id' => $form->form_id,
                'form_name' => $form->form_name,
                'description' => $form->description,
                'is_active' => $form->is_active,
                'open_date' => $form->settings?->created_at?->toDateString(),
                'close_date' => $form->settings?->submission_deadline?->toDateString(),
                'sections' => $form->fields->groupBy('section_title')->map(function ($fields, $sectionTitle) {
                    return [
                        'title' => $sectionTitle ?? '',
                        'fields' => $fields->map(function ($field) {
                            return [
                                'field_id' => $field->field_id,
                                'field_name' => $field->field_name,
                                'field_type' => $field->field_type,
                                'is_required' => (bool) $field->is_required,
                                'options' => $field->options ? explode(',', $field->options) : null,
                                'order' => (int) $field->order,
                                'file_path' => $field->file_path ? Storage::url($field->file_path) : null,
                                'is_active' => $field->is_active,
                            ];
                        })->sortBy('order')->values()->toArray(),
                    ];
                })->values(),
            ] : null;

            return Inertia::render('ScholarshipDetail', [
                'scholarship' => $scholarship,
                'form' => $formData,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::guestShow: ' . $e->getMessage());
            return redirect()->route('guest.scholarship.index')->with('error', 'Beasiswa tidak ditemukan.');
        }
    }

    // Show form for submission
    public function showForm($form_id)
    {
        try {
            $form = ScholarshipForm::with(['fields', 'settings', 'scholarship'])
                ->where('form_id', $form_id)
                ->where('is_active', true)
                ->firstOrFail();

            $formData = [
                'form_id' => $form->form_id,
                'form_name' => $form->form_name,
                'description' => $form->description,
                'is_active' => $form->is_active,
                'open_date' => $form->settings?->created_at?->toDateString(),
                'close_date' => $form->settings?->submission_deadline?->toDateString(),
                'sections' => $form->fields->groupBy('section_title')->map(function ($fields, $sectionTitle) {
                    return [
                        'title' => $sectionTitle ?? '',
                        'fields' => $fields->map(function ($field) {
                            return [
                                'field_id' => $field->field_id,
                                'field_name' => $field->field_name,
                                'field_type' => $field->field_type,
                                'is_required' => (bool) $field->is_required,
                                'options' => $field->options ? explode(',', $field->options) : null,
                                'order' => (int) $field->order,
                                'file_path' => $field->file_path ? Storage::url($field->file_path) : null,
                                'is_active' => $field->is_active,
                            ];
                        })->sortBy('order')->values()->toArray(),
                    ];
                })->values(),
            ];

            return Inertia::render('ScholarshipForm', [
                'form' => $formData,
                'scholarship' => [
                    'scholarship_id' => $form->scholarship->scholarship_id,
                    'name' => $form->scholarship->name,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::showForm: ' . $e->getMessage());
            return redirect()->route('guest.scholarship.index')->with('error', 'Formulir tidak ditemukan.');
        }
    }

 public function submit(Request $request)
{
    try {
        $validatedData = $request->validate([
            'form_id' => 'required|exists:scholarship_forms,form_id',
            'data' => 'required|array',
        ]);

        $form = ScholarshipForm::with(['settings'])->where('form_id', $validatedData['form_id'])->firstOrFail();
        $user = Auth::user();

        if (!$form->settings?->accept_responses) {
            return response()->json(['error' => 'Formulir ini tidak menerima tanggapan saat ini.'], 403);
        }

        if ($form->settings?->submission_deadline && now()->greaterThan($form->settings->submission_deadline)) {
            return response()->json(['error' => 'Batas waktu pengiriman telah berakhir.'], 403);
        }

        if ($form->settings?->max_submissions) {
            $submissionCount = FormSubmission::where('form_id', $form->form_id)->count();
            if ($submissionCount >= $form->settings->max_submissions) {
                return response()->json(['error' => 'Batas maksimum pengiriman telah tercapai.'], 403);
            }
        }

        if ($form->settings?->one_submission_per_email && $user) {
            $existingSubmission = FormSubmission::where('form_id', $form->form_id)
                ->where('user_id', $user->id)
                ->exists();
            if ($existingSubmission) {
                return response()->json(['error' => 'Anda hanya dapat mengirimkan satu tanggapan untuk formulir ini.'], 403);
            }
        }

        $fields = FormField::where('form_id', $form->form_id)->get();
        $submittedData = $validatedData['data'];
        $processedData = [];

        foreach ($fields as $field) {
            $fieldId = $field->field_id;
            $fieldValue = $submittedData[$fieldId] ?? null;

            if ($field->is_required && (is_null($fieldValue) || $fieldValue === '')) {
                return response()->json(['error' => "Field '{$field->field_name}' wajib diisi."], 422);
            }

            if ($field->field_type === 'file' && $request->hasFile("data.$fieldId")) {
                $file = $request->file("data.$fieldId");
                $path = $file->store('form_submissions', 'public');
                $processedData[$fieldId] = $path;
            } else {
                $processedData[$fieldId] = $fieldValue;
            }
        }

        $submissionId = $this->generateId('FSUB', 'submission_id', 'form_submissions');
        FormSubmission::create([
            'submission_id' => $submissionId,
            'form_id' => $form->form_id,
            'user_id' => $user?->id,
            'data' => $processedData,
        ]);

        return redirect()->route('guest.scholarship.index')->with('success', 'Formulir berhasil dikirim!');
    } catch (\Exception $e) {
        Log::error('Error in FormController::submit: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
        return response()->json(['error' => 'Gagal mengirimkan formulir: ' . $e->getMessage()], 500);
    }
}

}

