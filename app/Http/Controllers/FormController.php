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
use Illuminate\Database\QueryException;

class FormController extends Controller
{
    /**
     * Generate a unique ID with a prefix and padded number.
     */
    private function generateId(string $prefix, string $column, string $table): string
    {
        $lastRecord = DB::table($table)->orderBy($column, 'desc')->first();
        $lastNumber = $lastRecord ? (int) substr($lastRecord->$column, strlen($prefix)) : 0;
        return $prefix . str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Determine if a form is active based on form settings.
     */
    private function isFormActive(?FormSetting $settings): bool
    {
        if (!$settings) {
            return false;
        }
        $now = now();
        if ($settings->submission_start && $settings->submission_deadline) {
            return $now->between($settings->submission_start, $settings->submission_deadline);
        }
        if ($settings->submission_start) {
            return $now->gte($settings->submission_start);
        }
        if ($settings->submission_deadline) {
            return $now->lte($settings->submission_deadline);
        }
        return $settings->accept_responses;
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
                'settings:setting_id,form_id,submission_start,submission_deadline,accept_responses'
            ]);

            if ($statusFilter === 'active') {
                $query->whereHas('settings', function ($q) {
                    $now = now();
                    $q->where(function ($subQ) use ($now) {
                        $subQ->whereBetween('submission_start', [$now->startOfDay(), $now->endOfDay()])
                            ->orWhereBetween('submission_deadline', [$now->startOfDay(), $now->endOfDay()])
                            ->orWhere('accept_responses', true);
                    });
                });
            } elseif ($statusFilter === 'inactive') {
                $query->whereHas('settings', function ($q) {
                    $now = now();
                    $q->where(function ($subQ) use ($now) {
                        $subQ->where('submission_deadline', '<', $now)
                            ->orWhereNull('submission_start')
                            ->orWhere('accept_responses', false);
                    });
                });
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
                        'is_active' => $this->isFormActive($form->settings),
                        'status' => $this->isFormActive($form->settings) ? 'Aktif' : 'Non-Aktif',
                        'settings' => $form->settings ? [
                            'setting_id' => $form->settings->setting_id,
                            'form_id' => $form->settings->form_id,
                            'accept_responses' => $form->settings->accept_responses,
                            'submission_start' => $form->settings->submission_start,
                            'submission_deadline' => $form->settings->submission_deadline,
                            'max_submissions' => $form->settings->max_submissions,
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
                'submission_start' => 'nullable|date', // Added for form settings
                'submission_deadline' => 'nullable|date|after_or_equal:submission_start', // Added for form settings
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
                    'created_by' => $validatedData['created_by'],
                ]);

                $settingId = $this->generateId('FS', 'setting_id', 'form_settings');
                FormSetting::create([
                    'setting_id' => $settingId,
                    'form_id' => $formId,
                    'accept_responses' => true,
                    'submission_start' => $validatedData['submission_start'],
                    'submission_deadline' => $validatedData['submission_deadline'],
                    'max_submissions' => null,
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
                    'submission_start' => $form->settings?->submission_start ? $form->settings->submission_start->toDateTimeString() : null,
                    'submission_deadline' => $form->settings?->submission_deadline ? $form->settings->submission_deadline->toDateTimeString() : null,
                    'is_active' => $this->isFormActive($form->settings),
                    'status' => $this->isFormActive($form->settings) ? 'Aktif' : 'Non-Aktif',
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
                'submission_start' => 'nullable|date', // Added for form settings
                'submission_deadline' => 'nullable|date|after_or_equal:submission_start', // Added for form settings
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

                // Update or create form settings
                $settings = FormSetting::where('form_id', $form->form_id)->first();
                if ($settings) {
                    $settings->update([
                        'submission_start' => $validatedData['submission_start'],
                        'submission_deadline' => $validatedData['submission_deadline'],
                        'updated_by' => $validatedData['updated_by'],
                    ]);
                } else {
                    $settingId = $this->generateId('FS', 'setting_id', 'form_settings');
                    FormSetting::create([
                        'setting_id' => $settingId,
                        'form_id' => $form->form_id,
                        'accept_responses' => true,
                        'submission_start' => $validatedData['submission_start'],
                        'submission_deadline' => $validatedData['submission_deadline'],
                        'max_submissions' => null,
                        'created_by' => $validatedData['updated_by'],
                        'updated_by' => $validatedData['updated_by'],
                    ]);
                }

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
        } catch (\Illuminate\Validation\ValidationException $e) {
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
                    'submission_start' => $settings->submission_start ? $settings->submission_start->toDateTimeString() : null,
                    'submission_deadline' => $settings->submission_deadline ? $settings->submission_deadline->toDateTimeString() : null,
                    'max_submissions' => $settings->max_submissions,
                ] : [
                    'form_id' => $form->form_id,
                    'accept_responses' => true,
                    'submission_start' => null,
                    'submission_deadline' => null,
                    'max_submissions' => null,
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
                'submission_start' => 'nullable|date',
                'submission_deadline' => 'nullable|date|after_or_equal:submission_start',
                'max_submissions' => 'nullable|integer|min:1',
            ]);

            return DB::transaction(function () use ($request, $validatedData, $form) {
                $user = Auth::user();
                $settings = FormSetting::where('form_id', $form->form_id)->first();

                $attributes = [
                    'accept_responses' => $validatedData['accept_responses'],
                    'submission_start' => $validatedData['submission_start'],
                    'submission_deadline' => $validatedData['submission_deadline'],
                    'max_submissions' => $validatedData['max_submissions'],
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
                    'is_active' => $this->isFormActive($form->settings),
                    'status' => $this->isFormActive($form->settings) ? 'Aktif' : 'Non-Aktif',
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

    public function showForm($form_id)
    {
        try {
            $form = ScholarshipForm::with(['fields', 'settings', 'scholarship'])
                ->where('form_id', $form_id)
                ->firstOrFail();

            if (!$this->isFormActive($form->settings)) {
                return redirect()->route('scholarships.index')->with('error', 'Formulir ini tidak aktif.');
            }

            $user = Auth::user();
            $submission = null;
            if ($user && strtolower($user->role) === 'mahasiswa') {
                $submission = FormSubmission::where('form_id', $form_id)
                    ->where('user_id', $user->id)
                    ->first();
            }

            $formData = [
                'form_id' => $form->form_id,
                'form_name' => $form->form_name,
                'description' => $form->description,
                'is_active' => $this->isFormActive($form->settings),
                'accept_responses' => $form->settings?->accept_responses ?? false,
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
                'auth' => ['user' => $user],
                'userRole' => $user ? strtolower($user->role) : 'guest',
                'form' => $formData,
                'scholarship' => [
                    'scholarship_id' => $form->scholarship->scholarship_id,
                    'name' => $form->scholarship->name,
                ],
                'submission' => $submission ? [
                    'submission_id' => $submission->submission_id,
                    'data' => $submission->data,
                ] : null,
                'flash' => session()->only(['success', 'error']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::showForm: ' . $e->getMessage());
            return redirect()->route('scholarships.index')->with('error', 'Formulir tidak ditemukan.');
        }
    }

    public function storeSubmission(Request $request)
    {
        Log::info('storeSubmission method called', [
            'request_data' => $request->all(),
            'files' => $request->allFiles(),
            'user' => Auth::user(),
        ]);

        $user = Auth::user();

        if (!$user || strtolower($user->role) !== 'mahasiswa') {
            Log::warning('User not authenticated or not mahasiswa', [
                'user' => $user,
            ]);
            return redirect()->route('login')->with('error', 'Anda harus login sebagai mahasiswa untuk mengirimkan formulir.');
        }

        try {
            $validatedData = $request->validate([
                'form_id' => 'required|exists:scholarship_forms,form_id',
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'data' => 'required|array',
            ]);

            Log::info('Form submission received', [
                'form_id' => $validatedData['form_id'],
                'scholarship_id' => $validatedData['scholarship_id'],
                'user_id' => $user->id,
                'data' => $validatedData['data'],
            ]);

            $form = ScholarshipForm::with('settings')
                ->where('form_id', $validatedData['form_id'])
                ->firstOrFail();

            if (!$this->isFormActive($form->settings) || !$form->settings->accept_responses) {
                Log::warning('Form submission rejected: Form not accepting responses', [
                    'form_id' => $validatedData['form_id'],
                ]);
                return redirect()->back()->with('error', 'Formulir ini tidak menerima pengajuan saat ini.');
            }

            $submissionData = $validatedData['data'];
            $processedData = [];

            $fields = FormField::where('form_id', $validatedData['form_id'])->get();
            foreach ($fields as $field) {
                $fieldKey = "sections.{$field->section_title}.fields.{$field->order}";
                $value = $submissionData[$fieldKey] ?? null;

                if ($field->is_required && (is_null($value) || $value === '')) {
                    Log::warning('Form submission rejected: Required field missing', [
                        'form_id' => $validatedData['form_id'],
                        'field' => $field->field_name,
                    ]);
                    return redirect()->back()->with('error', "Field {$field->field_name} wajib diisi.");
                }

                if ($field->field_type === 'file') {
                    $fileArray = $request->file('data') ?? [];
                    $file = $fileArray[$fieldKey] ?? null;

                    if ($file && $file instanceof \Illuminate\Http\UploadedFile) {
                        Log::info('File detected for field', [
                            'field_key' => $fieldKey,
                            'file_name' => $file->getClientOriginalName(),
                        ]);
                        $path = $file->store('submissions', 'public');
                        $processedData[$fieldKey] = $path;
                    } else {
                        Log::warning('No file detected for field', [
                            'field_key' => $fieldKey,
                        ]);
                        $processedData[$fieldKey] = $value;
                    }
                } else {
                    $processedData[$fieldKey] = $value;
                }
            }

            DB::beginTransaction();

            $submissionId = $this->generateId('FSUB', 'submission_id', 'form_submissions');
            $submission = FormSubmission::create([
                'submission_id' => $submissionId,
                'form_id' => $validatedData['form_id'],
                'user_id' => $user->id,
                'data' => $processedData,
                'personal_data' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'nim' => $user->nim,
                ],
                'submitted_at' => now(),
            ]);

            DB::commit();

            Log::info('Form submission saved successfully', [
                'submission_id' => $submission->submission_id,
                'form_id' => $submission->form_id,
                'user_id' => $submission->user_id,
                'data' => $processedData,
            ]);

            return redirect()->route('scholarships.show', $validatedData['scholarship_id'])
                ->with('success', 'Pengajuan berhasil dikirim.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed in storeSubmission', [
                'user_id' => $user->id,
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()
                ->with('error', 'Gagal memvalidasi data. Silakan periksa input Anda.')
                ->withErrors($e->errors());
        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollBack();
            Log::error('Failed to save form submission', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()
                ->with('error', 'Gagal menyimpan pengajuan. Silakan coba lagi.')
                ->withErrors(['general' => 'Gagal menyimpan pengajuan: ' . $e->getMessage()]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Unexpected error while saving form submission', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan. Silakan coba lagi.')
                ->withErrors(['general' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    public function responses($form_id)
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);

            $form = ScholarshipForm::with(['settings', 'scholarship:name'])
                ->where('form_id', $form_id)
                ->firstOrFail();

            $submissions = FormSubmission::with('user:id,name,email,nim,prodi,angkatan')
                ->where('form_id', $form_id)
                ->orderBy('submitted_at', 'desc')
                ->get()
                ->map(function ($submission) {
                    return [
                        'submission_id' => $submission->submission_id,
                        'user' => [
                            'id' => $submission->user->id,
                            'name' => $submission->user->name,
                            'email' => $submission->user->email,
                            'nim' => $submission->user->nim,
                            'prodi' => $submission->user->prodi,
                            'angkatan' => $submission->user->angkatan,
                        ],
                        'submitted_at' => $submission->submitted_at->toDateTimeString(),
                        'status' => $submission->status,
                        'data' => $submission->data,
                    ];
                });

            return Inertia::render('Admin/Form/Responses', [
                'auth' => ['user' => $user],
                'userRole' => $role,
                'permissions' => RoleHelper::getRolePermissions($role),
                'form' => [
                    'form_id' => $form->form_id,
                    'form_name' => $form->form_name,
                    'scholarship_name' => $form->scholarship->name ?? '-',
                    'open_date' => $form->settings?->submission_start ? $form->settings->submission_start->toDateTimeString() : '-',
                    'close_date' => $form->settings?->submission_deadline ? $form->settings->submission_deadline->toDateTimeString() : '-',
                ],
                'submissions' => $submissions,
                'menu' => RoleHelper::getNavigationMenu($role),
                'flash' => session()->only(['success', 'error']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in FormController::responses: ' . $e->getMessage(), [
                'form_id' => $form_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('admin.form.index')->with('error', 'Gagal memuat daftar respons formulir.');
        }
    }

    public function responseDetail($form_id, $submission_id)
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);

            Log::info('FormController::responseDetail called', [
                'form_id' => $form_id,
                'submission_id' => $submission_id,
                'user_role' => $role,
            ]);

            $form = ScholarshipForm::with(['settings', 'scholarship:name', 'fields'])
                ->where('form_id', $form_id)
                ->firstOrFail();

            $submission = FormSubmission::with('user:id,name,email,nim,prodi,angkatan')
                ->where('submission_id', $submission_id)
                ->where('form_id', $form_id)
                ->firstOrFail();

            $fields = $form->fields->map(function ($field) {
                return [
                    'field_id' => $field->field_id,
                    'field_name' => $field->field_name,
                    'field_type' => $field->field_type,
                    'is_required' => (bool) $field->is_required,
                    'order' => (int) $field->order,
                    'section_title' => $field->section_title ?? 'default',
                ];
            })->sortBy('order')->values();

            Log::info('Fields retrieved', ['fields' => $fields->toArray()]);

            $submissionData = $submission->data;
            $organizedData = [];
            foreach ($fields as $field) {
                $sectionTitle = $field['section_title'] ?? 'default';
                $fieldKey = "sections.{$sectionTitle}.fields.{$field['order']}";
                $value = $submissionData[$fieldKey] ?? null;

                if ($field['field_type'] === 'file' && $value) {
                    $fileExists = Storage::disk('public')->exists($value);
                    Log::info('Checking file existence', [
                        'file_path' => $value,
                        'exists' => $fileExists,
                    ]);

                    if ($fileExists) {
                        $fileUrl = Storage::url($value);
                        Log::info('Generated file URL', [
                            'file_path' => $value,
                            'file_url' => $fileUrl,
                        ]);
                        $value = $fileUrl;
                    } else {
                        Log::warning('File not found in storage', [
                            'file_path' => $value,
                        ]);
                        $value = null;
                    }
                }

                $organizedData[] = [
                    'field_name' => $field['field_name'],
                    'value' => $value,
                    'field_type' => $field['field_type'],
                ];
            }

            Log::info('Organized data', ['organizedData' => $organizedData]);

            $menu = RoleHelper::getNavigationMenu($role);
            if (empty($menu)) {
                Log::warning('Menu is empty for role: ' . $role, ['method' => 'responseDetail']);
            } else {
                Log::info('Menu retrieved successfully', ['menu' => $menu]);
            }

            return Inertia::render('Admin/Form/ResponsesDetail', [
                'auth' => ['user' => $user],
                'userRole' => $role,
                'permissions' => RoleHelper::getRolePermissions($role),
                'form' => [
                    'form_id' => $form->form_id,
                    'form_name' => $form->form_name,
                    'scholarship_name' => $form->scholarship->name ?? '-',
                ],
                'submission' => [
                    'submission_id' => $submission->submission_id,
                    'user' => [
                        'id' => $submission->user->id,
                        'name' => $submission->user->name,
                        'email' => $submission->user->email,
                        'nim' => $submission->user->nim,
                        'prodi' => $submission->user->prodi ?? '-',
                        'angkatan' => $submission->user->angkatan ?? '-',
                    ],
                    'submitted_at' => $submission->submitted_at->toDateTimeString(),
                    'status' => $submission->status,
                    'data' => $organizedData,
                ],
                'menu' => $menu,
                'flash' => session()->only(['success', 'error']),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Form or Submission not found in FormController::responseDetail', [
                'form_id' => $form_id,
                'submission_id' => $submission_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('admin.form.responses', ['form' => $form_id])->with('error', 'Formulir atau pengajuan tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Error in FormController::responseDetail: ' . $e->getMessage(), [
                'form_id' => $form_id,
                'submission_id' => $submission_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('admin.form.responses', ['form' => $form_id])->with('error', 'Gagal memuat detail respons: ' . $e->getMessage());
        }
    }

    public function updateStatus(Request $request, $form_id, $submission_id)
    {
        try {
            $submission = FormSubmission::where('form_id', $form_id)
                ->where('submission_id', $submission_id)
                ->firstOrFail();

            $validStatuses = ['MENUNGGU', 'TIDAK_LOLOS_ADMINISTRASI', 'LULUS_ADMINISTRASI', 'TIDAK_LOLOS_TAHAP_AKHIR', 'LULUS_TAHAP_AKHIR'];
            $status = $request->input('status');

            if (!in_array($status, $validStatuses)) {
                Log::warning('Invalid status attempted', [
                    'form_id' => $form_id,
                    'submission_id' => $submission_id,
                    'status' => $status,
                ]);
                return redirect()->back()->with('error', 'Status tidak valid.');
            }

            $submission->update(['status' => $status]);

            Log::info('Status updated successfully', [
                'form_id' => $form_id,
                'submission_id' => $submission_id,
                'new_status' => $status,
            ]);

            return redirect()->back()->with('success', 'Status berhasil diperbarui.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Submission not found in FormController::updateStatus', [
                'form_id' => $form_id,
                'submission_id' => $submission_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Pengajuan tidak ditemukan.');
        } catch (QueryException $e) {
            Log::error('Database error in FormController::updateStatus', [
                'form_id' => $form_id,
                'submission_id' => $submission_id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Gagal memperbarui status karena kesalahan database.');
        } catch (\Exception $e) {
            Log::error('Error in FormController::updateStatus: ' . $e->getMessage(), [
                'form_id' => $form_id,
                'submission_id' => $submission_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Gagal memperbarui status: ' . $e->getMessage());
        }
    }

    public function export($form_id, $type = null)
    {
        try {
            $form = ScholarshipForm::where('form_id', $form_id)->firstOrFail();

            $submissionsQuery = FormSubmission::with('user:id,name,email,nim,prodi,angkatan')
                ->where('form_id', $form_id)
                ->orderBy('submitted_at', 'desc');

            if ($type === 'lulus-administrasi') {
                $submissionsQuery->where('status', 'LULUS_ADMINISTRASI');
            } elseif ($type === 'lulus-tahap-akhir') {
                $submissionsQuery->where('status', 'LULUS_TAHAP_AKHIR');
            }

            $submissions = $submissionsQuery->get();

            if ($submissions->isEmpty()) {
                return redirect()->back()->with('error', 'Tidak ada data untuk diekspor.');
            }

            $data = [];
            $data[] = ['No', 'Nama', 'NIM', 'Prodi', 'Angkatan', 'Email', 'Tanggal Pengajuan', 'Status'];

            foreach ($submissions as $index => $submission) {
                $data[] = [
                    $index + 1,
                    $submission->user->name ?? '-',
                    $submission->user->nim ?? '-',
                    $submission->user->prodi ?? '-',
                    $submission->user->angkatan ?? '-',
                    $submission->user->email ?? '-',
                    $submission->submitted_at->toDateTimeString(),
                    $submission->status ?? 'MENUNGGU',
                ];
            }

            return \Maatwebsite\Excel\Facades\Excel::download(
                new class($data) implements \Maatwebsite\Excel\Concerns\FromArray {
                    private $data;

                    public function __construct(array $data) {
                        $this->data = $data;
                    }

                    public function array(): array {
                        return $this->data;
                    }
                },
                "Respons_Form_{$form->form_name}_" . ($type ? "{$type}_" : '') . now()->format('Y-m-d') . '.xlsx',
                \Maatwebsite\Excel\Excel::XLSX
            );
        } catch (\Exception $e) {
            Log::error('Error in FormController::export: ' . $e->getMessage(), [
                'form_id' => $form_id,
                'type' => $type,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Gagal mengekspor data: ' . $e->getMessage());
        }
    }
}