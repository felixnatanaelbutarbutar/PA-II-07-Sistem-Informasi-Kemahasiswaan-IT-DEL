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

            $searchTerm = $request->input('search', '');
            $statusFilter = $request->input('status', 'all');
            $sortBy = $request->input('sort_by', 'form_name');
            $sortDirection = $request->input('sort_direction', 'asc');

            $query = ScholarshipForm::with([
                'scholarship:scholarship_id,name',
                'creator:id,name',
                'settings:setting_id,form_id,submission_start,submission_deadline,is_active'
            ]);

            // Update settings status before querying
            FormSetting::whereNotNull('submission_start')->orWhereNotNull('submission_deadline')->get()->each(function ($setting) {
                $setting->checkAndActivateForm();
            });

            if ($statusFilter === 'active') {
                $query->where('is_active', true);
            } elseif ($statusFilter === 'inactive') {
                $query->where('is_active', false);
            }

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

            if ($sortBy === 'form_name') {
                $query->orderBy('form_name', $sortDirection);
            } elseif ($sortBy === 'scholarship_name') {
                $query->join('scholarships', 'scholarship_forms.scholarship_id', '=', 'scholarships.scholarship_id')
                      ->orderBy('scholarships.name', $sortDirection);
            } elseif ($sortBy === 'open_date') {
                $query->leftJoin('form_settings', 'scholarship_forms.form_id', '=', 'form_settings.form_id')
                      ->orderBy('form_settings.submission_start', $sortDirection);
            } elseif ($sortBy === 'close_date') {
                $query->leftJoin('form_settings', 'scholarship_forms.form_id', '=', 'form_settings.form_id')
                      ->orderBy('form_settings.submission_deadline', $sortDirection);
            }

            $forms = $query->get()->map(function ($form) {
                try {
                    return [
                        'form_id' => $form->form_id,
                        'form_name' => $form->form_name ?? '-',
                        'description' => $form->description ?? '-',
                        'scholarship_name' => $form->scholarship?->name ?? '-',
                        'created_by' => $form->creator?->name ?? '-',
                        'open_date' => $form->settings?->submission_start ? $form->settings->submission_start->toDateTimeString() : '-',
                        'close_date' => $form->settings?->submission_deadline ? $form->settings->submission_deadline->toDateTimeString() : '-',
                        'is_active' => $form->is_active,
                        'status' => $form->is_active ? 'Aktif' : 'Non-Aktif',
                        'settings' => $form->settings ? [
                            'setting_id' => $form->settings->setting_id,
                            'form_id' => $form->settings->form_id,
                            'accept_responses' => $form->settings->accept_responses,
                            'one_submission_per_email' => $form->settings->one_submission_per_email,
                            'allow_edit' => $form->settings->allow_edit,
                            'submission_start' => $form->settings->submission_start,
                            'submission_deadline' => $form->settings->submission_deadline,
                            'max_submissions' => $form->settings->max_submissions,
                            'response_notification' => $form->settings->response_notification,
                            'is_active' => $form->settings->is_active,
                        ] : null,
                    ];
                } catch (\Exception $e) {
                    Log::warning('Error mapping form ID ' . $form->form_id . ': ' . $e->getMessage());
                    return null;
                }
            })->filter()->values();

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
                    'sort_by' => $sortBy,
                    'sort_direction' => $sortDirection,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::index: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return Inertia::render('Admin/Form/index', [
                'auth' => ['user' => Auth::user()],
                'userRole' => strtolower(Auth::user()->role),
                'permissions' => RoleHelper::getRolePermissions(strtolower(Auth::user()->role)),
                'forms' => [],
                'scholarships' => Scholarship::select('scholarship_id', 'name')->get(),
                'menu' => RoleHelper::getNavigationMenu(strtolower(Auth::user()->role)),
                'flash' => ['error' => 'Gagal memuat daftar formulir: ' . $e->getMessage()],
                'filters' => [
                    'search' => '',
                    'status' => 'all',
                    'sort_by' => 'form_name',
                    'sort_direction' => 'asc',
                ],
            ]);
        }
    }

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
            return redirect()->route('admin.form.index')->with('error', 'Gagal memuat halaman tambah formulir.');
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'form_name' => 'required|string|max:100',
                'description' => 'nullable|string',
                'created_by' => 'required|exists:users,id',
                'sections' => 'required|array|min:1',
                'sections.*.title' => 'nullable|string|max:100',
                'sections.*.fields' => 'required|array|min:1',
                'sections.*.fields.*.field_name' => 'required|string|max:100',
                'sections.*.fields.*.field_type' => 'required|in:text,number,date,dropdown,file,quill',
                'sections.*.fields.*.is_required' => 'required|boolean',
                'sections.*.fields.*.order' => 'required|integer|min:1',
                'sections.*.fields.*.options' => 'nullable|string',
                'sections.*.fields.*.file' => 'nullable|file|mimes:pdf,doc,docx,jpeg,png|max:2048',
            ]);

            return DB::transaction(function () use ($request, $validatedData) {
                $formId = $this->generateId('SF', 'form_id', 'scholarship_forms');

                $form = ScholarshipForm::create([
                    'form_id' => $formId,
                    'scholarship_id' => $validatedData['scholarship_id'],
                    'form_name' => $validatedData['form_name'],
                    'description' => $validatedData['description'],
                    'is_active' => false,
                    'created_by' => $validatedData['created_by'],
                ]);

                $settingId = $this->generateId('FS', 'setting_id', 'form_settings');
                FormSetting::create([
                    'setting_id' => $settingId,
                    'form_id' => $formId,
                    'accept_responses' => true,
                    'one_submission_per_email' => false,
                    'allow_edit' => true,
                    'submission_start' => null,
                    'submission_deadline' => null,
                    'max_submissions' => null,
                    'response_notification' => false,
                    'is_active' => false,
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
                            'order' => $globalOrder,
                            'file_path' => null,
                            'is_active' => true,
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

    public function edit(ScholarshipForm $form)
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);

            $form->load(['scholarship:scholarship_id,name', 'fields', 'settings']);
            if ($form->settings) {
                $form->settings->checkAndActivateForm();
            }

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
                            'order' => (int) $field->order,
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
            return redirect()->route('admin.form.index')->with('error', 'Gagal memuat halaman edit formulir.');
        }
    }

    public function update(Request $request, ScholarshipForm $form)
    {
        try {
            $validatedData = $request->validate([
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'form_name' => 'required|string|max:100',
                'description' => 'nullable|string',
                'updated_by' => 'required|exists:users,id',
                'sections' => 'required|array|min:1',
                'sections.*.title' => 'nullable|string|max:100',
                'sections.*.fields' => 'required|array|min:1',
                'sections.*.fields.*.field_name' => 'required|string|max:100',
                'sections.*.fields.*.field_type' => 'required|in:text,number,date,dropdown,file,quill',
                'sections.*.fields.*.is_required' => 'required|boolean',
                'sections.*.fields.*.order' => 'required|integer|min:1',
                'sections.*.fields.*.options' => 'nullable|string',
                'sections.*.fields.*.file' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
                'sections.*.fields.*.field_id' => 'nullable|string|exists:form_fields,field_id',
                'sections.*.fields.*.is_active' => 'boolean',
            ]);

            return DB::transaction(function () use ($request, $validatedData, $form) {
                $form->update([
                    'scholarship_id' => $validatedData['scholarship_id'],
                    'form_name' => $validatedData['form_name'],
                    'description' => $validatedData['description'],
                    'updated_by' => $validatedData['updated_by'],
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
                            'order' => $globalOrder,
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
                                'updated_by' => $validatedData['updated_by'],
                            ]));
                        } else {
                            $fieldId = $this->generateId('FF', 'field_id', 'form_fields');
                            FormField::create(array_merge($fieldAttributes, [
                                'field_id' => $fieldId,
                                'created_by' => $validatedData['updated_by'],
                                'updated_by' => $validatedData['updated_by'],
                            ]));
                        }
                        $globalOrder++;
                    }
                }

                return redirect()->route('admin.form.index')->with('success', 'Formulir berhasil diperbarui.');
            });
        } catch (\ValidationException $e) {
            Log::error('Validation error in FormController::update: ' . json_encode($e->errors()), [
                'form_id' => $form->form_id,
                'request_data' => $request->except(['sections.*.fields.*.file']),
            ]);
            return redirect()->back()->withErrors($e->errors())->with('error', 'Gagal memperbarui formulir: Periksa kembali isian Anda.');
        } catch (\Exception $e) {
            Log::error('Error in FormController::update: ' . $e->getMessage(), [
                'form_id' => $form->form_id,
                'request_data' => $request->except(['sections.*.fields.*.file']),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Gagal memperbarui formulir: ' . $e->getMessage());
        }
    }

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

                return redirect()->route('admin.form.index')->with('success', 'Formulir berhasil dihapus.');
            });
        } catch (\Exception $e) {
            Log::error('Error in FormController::destroy: ' . $e->getMessage(), [
                'form_id' => $form->form_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Gagal menghapus formulir: ' . $e->getMessage());
        }
    }

    public function settings(ScholarshipForm $form)
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);
            $settings = FormSetting::where('form_id', $form->form_id)->first();

            if ($settings) {
                $settings->checkAndActivateForm();
            }

            return Inertia::render('Admin/Form/settings', [
                'auth' => ['user' => $user],
                'userRole' => $role,
                'permissions' => RoleHelper::getRolePermissions($role),
                'form' => [
                    'form_id' => $form->form_id,
                    'form_name' => $form->form_name,
                ],
                'settings' => $settings ? [
                    'setting_id' => $settings->setting_id,
                    'form_id' => $settings->form_id,
                    'accept_responses' => $settings->accept_responses,
                    'one_submission_per_email' => $settings->one_submission_per_email,
                    'allow_edit' => $settings->allow_edit,
                    'submission_start' => $settings->submission_start ? $settings->submission_start->toDateTimeString() : null,
                    'submission_deadline' => $settings->submission_deadline ? $settings->submission_deadline->toDateTimeString() : null,
                    'max_submissions' => $settings->max_submissions,
                    'response_notification' => $settings->response_notification,
                    'is_active' => $settings->is_active,
                ] : [
                    'form_id' => $form->form_id,
                    'accept_responses' => true,
                    'one_submission_per_email' => false,
                    'allow_edit' => true,
                    'submission_start' => null,
                    'submission_deadline' => null,
                    'max_submissions' => null,
                    'response_notification' => false,
                    'is_active' => false,
                ],
                'menu' => RoleHelper::getNavigationMenu($role),
                'flash' => session()->only(['success', 'error']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::settings: ' . $e->getMessage());
            return redirect()->route('admin.form.index')->with('error', 'Gagal memuat halaman pengaturan formulir.');
        }
    }

    public function updateSettings(Request $request, ScholarshipForm $form)
    {
        try {
            $validatedData = $request->validate([
                'accept_responses' => 'required|boolean',
                'one_submission_per_email' => 'required|boolean',
                'allow_edit' => 'required|boolean',
                'response_notification' => 'required|boolean',
                'submission_start' => 'nullable|date',
                'submission_deadline' => 'nullable|date|after_or_equal:submission_start',
                'max_submissions' => 'nullable|integer|min:1',
            ]);

            return DB::transaction(function () use ($request, $validatedData, $form) {
                $user = Auth::user();
                $settings = FormSetting::where('form_id', $form->form_id)->first();

                $attributes = [
                    'accept_responses' => $validatedData['accept_responses'],
                    'one_submission_per_email' => $validatedData['one_submission_per_email'],
                    'allow_edit' => $validatedData['allow_edit'],
                    'submission_start' => $validatedData['submission_start'],
                    'submission_deadline' => $validatedData['submission_deadline'],
                    'max_submissions' => $validatedData['max_submissions'],
                    'response_notification' => $validatedData['response_notification'],
                    'updated_by' => $user->id,
                ];

                if (!$settings) {
                    $settingId = $this->generateId('FS', 'setting_id', 'form_settings');
                    $settings = FormSetting::create(array_merge($attributes, [
                        'setting_id' => $settingId,
                        'form_id' => $form->form_id,
                        'created_by' => $user->id,
                        'is_active' => false,
                    ]));
                } else {
                    $settings->update($attributes);
                }

                $settings->checkAndActivateForm();

                return redirect()->route('admin.form.index')->with('success', 'Pengaturan formulir berhasil diperbarui.');
            });
        } catch (\Exception $e) {
            Log::error('Error in FormController::updateSettings: ' . $e->getMessage(), [
                'form_id' => $form->form_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Gagal memperbarui pengaturan formulir: ' . $e->getMessage());
        }
    }

    public function show(ScholarshipForm $form)
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);

            $form->load(['scholarship:scholarship_id,name', 'fields', 'settings']);
            if ($form->settings) {
                $form->settings->checkAndActivateForm();
            }

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
                            'order' => (int) $field->order,
                            'file_path' => $field->file_path ? Storage::url($field->file_path) : null,
                            'is_active' => $field->is_active,
                        ];
                    })->sortBy('order')->values()->toArray(),
                ];
            })->values();

            return Inertia::render('Admin/Form/show', [
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
                    'open_date' => $form->settings?->submission_start ? $form->settings->submission_start->toDateTimeString() : '-',
                    'close_date' => $form->settings?->submission_deadline ? $form->settings->submission_deadline->toDateTimeString() : '-',
                    'sections' => $sections,
                ],
                'scholarships' => Scholarship::select('scholarship_id', 'name')->get(),
                'menu' => RoleHelper::getNavigationMenu($role),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::show: ' . $e->getMessage());
            return redirect()->route('admin.form.index')->with('error', 'Gagal memuat halaman detail formulir.');
        }
    }

    public function guestIndex()
    {
        try {
            $scholarships = Scholarship::with('category')->where('is_active', true)->get();
            return Inertia::render('ScholarshipIndex', [
                'scholarships' => $scholarships,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::guestIndex: ' . $e->getMessage());
            return redirect()->route('guest.scholarship.index')->with('error', 'Gagal memuat daftar beasiswa.');
        }
    }

    public function guestShow($scholarship_id)
    {
        try {
            $scholarship = Scholarship::with('category')
                ->where('scholarship_id', $scholarship_id)
                ->where('is_active', true)
                ->firstOrFail();

            $form = ScholarshipForm::with(['fields', 'settings'])
                ->where('scholarship_id', $scholarship_id)
                ->where('is_active', true)
                ->first();

            if ($form && $form->settings) {
                $form->settings->checkAndActivateForm();
            }

            $formData = $form ? [
                'form_id' => $form->form_id,
                'form_name' => $form->form_name,
                'description' => $form->description,
                'is_active' => $form->is_active,
                'open_date' => $form->settings?->submission_start ? $form->settings->submission_start->toDateTimeString() : '-',
                'close_date' => $form->settings?->submission_deadline ? $form->settings->submission_deadline->toDateTimeString() : '-',
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

    public function showForm($form_id)
    {
        try {
            $form = ScholarshipForm::with(['fields', 'settings', 'scholarship'])
                ->where('form_id', $form_id)
                ->where('is_active', true)
                ->firstOrFail();

            if ($form->settings) {
                $form->settings->checkAndActivateForm();
            }

            $formData = [
                'form_id' => $form->form_id,
                'form_name' => $form->form_name,
                'description' => $form->description,
                'is_active' => $form->is_active,
                'open_date' => $form->settings?->submission_start ? $form->settings->submission_start->toDateTimeString() : '-',
                'close_date' => $form->settings?->submission_deadline ? $form->settings->submission_deadline->toDateTimeString() : '-',
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

            $form = ScholarshipForm::with(['settings'])
                ->where('form_id', $validatedData['form_id'])
                ->where('is_active', true)
                ->firstOrFail();

            if ($form->settings) {
                $form->settings->checkAndActivateForm();
            }

            $user = Auth::user();

            if (!$form->settings?->accept_responses) {
                return redirect()->back()->with('error', 'Formulir ini tidak menerima tanggapan saat ini.');
            }

            if ($form->settings?->submission_start && now()->lessThan($form->settings->submission_start)) {
                return redirect()->back()->with('error', 'Periode pengiriman belum dimulai.');
            }

            if ($form->settings?->submission_deadline && now()->greaterThan($form->settings->submission_deadline)) {
                return redirect()->back()->with('error', 'Batas waktu pengiriman telah berakhir.');
            }

            if ($form->settings?->max_submissions) {
                $submissionCount = FormSubmission::where('form_id', $form->form_id)->count();
                if ($submissionCount >= $form->settings->max_submissions) {
                    return redirect()->back()->with('error', 'Batas maksimum pengiriman telah tercapai.');
                }
            }

            if ($form->settings?->one_submission_per_email && $user) {
                $existingSubmission = FormSubmission::where('form_id', $form->form_id)
                    ->where('user_id', $user->id)
                    ->exists();
                if ($existingSubmission) {
                    return redirect()->back()->with('error', 'Anda hanya dapat mengirimkan satu tanggapan untuk formulir ini.');
                }
            }

            $fields = FormField::where('form_id', $form->form_id)->get();
            $submittedData = $validatedData['data'];
            $processedData = [];

            foreach ($fields as $field) {
                $fieldId = $field->field_id;
                $fieldValue = $submittedData[$fieldId] ?? null;

                if ($field->is_required && (is_null($fieldValue) || $fieldValue === '')) {
                    return redirect()->back()->with('error', "Field '{$field->field_name}' wajib diisi.");
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
            return redirect()->back()->with('error', 'Gagal mengirimkan formulir: ' . $e->getMessage());
        }
    }
}
