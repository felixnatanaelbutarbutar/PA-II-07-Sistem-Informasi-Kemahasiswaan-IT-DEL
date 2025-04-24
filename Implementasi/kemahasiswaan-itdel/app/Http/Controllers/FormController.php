<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use App\Models\ScholarshipForm;
use App\Models\FormField;
use App\Models\FormSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FormController extends Controller
{
    // Helper method to generate custom IDs
    private function generateId(string $prefix, string $column, string $table): string
    {
        $lastRecord = DB::table($table)->orderBy($column, 'desc')->first();
        $lastNumber = $lastRecord ? (int) substr($lastRecord->$column, strlen($prefix)) : 0;
        $newNumber = $lastNumber + 1;
        return $prefix . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    // Menampilkan daftar formulir
    public function index()
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);

            $forms = ScholarshipForm::with([
                'scholarship:scholarship_id,name',
                'creator:id,name',
                'settings:setting_id,form_id,submission_deadline,created_at'
            ])
                ->get()
                ->map(function ($form) {
                    return [
                        'form_id' => $form->form_id,
                        'form_name' => $form->form_name,
                        'description' => $form->description,
                        'scholarship_name' => $form->scholarship ? $form->scholarship->name : null,
                        'created_by' => $form->creator ? $form->creator->name : null,
                        'open_date' => $form->settings ? $form->settings->created_at->toDateTimeString() : null,
                        'close_date' => $form->settings ? $form->settings->submission_deadline : null,
                        'is_active' => $form->is_active,
                    ];
                });

            $scholarships = Scholarship::select('scholarship_id', 'name')->get();

            return Inertia::render('Admin/Form/index', [
                'auth' => ['user' => $user],
                'userRole' => $role,
                'permissions' => RoleHelper::getRolePermissions($role),
                'forms' => $forms,
                'scholarships' => $scholarships,
                'menu' => RoleHelper::getNavigationMenu($role),
            ]);
        } catch (\Exception $e) {
            Log::error('Error di FormController::index: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat daftar formulir: ' . $e->getMessage());
        }
    }

    // Menampilkan halaman untuk membuat formulir baru
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
            Log::error('Error di FormController::create: ' . $e->getMessage());
            return redirect()->route('admin.form.index')->with('error', 'Terjadi kesalahan saat memuat halaman tambah formulir.');
        }
    }

    // Menyimpan formulir baru
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'form_name' => 'required|string|max:100',
                'description' => 'nullable|string',
                'created_by' => 'required|exists:users,id',
                'sections' => 'required|array',
                'sections.*.title' => 'required|string|max:100',
                'sections.*.fields' => 'required|array',
                'sections.*.fields.*.field_name' => 'required|string|max:100',
                'sections.*.fields.*.field_type' => 'required|in:text,number,date,dropdown,file,quill',
                'sections.*.fields.*.is_required' => 'required|boolean',
                'sections.*.fields.*.order' => 'required|string|max:3',
                'sections.*.fields.*.options' => 'nullable|string',
                'sections.*.fields.*.file' => 'nullable|file|max:10240', // Max 10MB
            ]);

            return DB::transaction(function () use ($request, $validatedData) {
                $user = Auth::user();

                // Generate form_id
                $formId = $this->generateId('SF', 'form_id', 'scholarship_forms');

                // Create the form
                $form = ScholarshipForm::create([
                    'form_id' => $formId,
                    'scholarship_id' => $validatedData['scholarship_id'],
                    'form_name' => $validatedData['form_name'],
                    'description' => $validatedData['description'],
                    'is_active' => true,
                    'created_by' => $validatedData['created_by'],
                    'updated_by' => null,
                ]);

                // Generate setting_id
                $settingId = $this->generateId('FS', 'setting_id', 'form_settings');

                // Create default form settings
                FormSetting::create([
                    'setting_id' => $settingId,
                    'form_id' => $formId,
                    'accept_responses' => true,
                    'one_submission_per_email' => false,
                    'allow_edit' => true,
                    'submission_deadline' => null,
                    'max_submissions' => null,
                    'response_notification' => false,
                    'created_by' => $validatedData['created_by'],
                    'updated_by' => null,
                ]);

                // Create form fields
                $globalOrder = 1;
                foreach ($validatedData['sections'] as $sectionIndex => $section) {
                    foreach ($section['fields'] as $fieldIndex => $fieldData) {
                        // Generate field_id
                        $fieldId = $this->generateId('FF', 'field_id', 'form_fields');

                        $fieldAttributes = [
                            'field_id' => $fieldId,
                            'form_id' => $formId,
                            'section_title' => $section['title'],
                            'field_name' => $fieldData['field_name'],
                            'field_type' => $fieldData['field_type'],
                            'is_required' => $fieldData['is_required'] ? '1' : '0',
                            'options' => $fieldData['options'] ?? null,
                            'order' => $globalOrder,
                            'file_path' => null,
                            'created_by' => $validatedData['created_by'],
                            'updated_by' => null,
                        ];

                        // Handle file upload
                        if ($fieldData['field_type'] === 'file' && $request->hasFile("sections.$sectionIndex.fields.$fieldIndex.file")) {
                            $file = $request->file("sections.$sectionIndex.fields.$fieldIndex.file");
                            $path = $file->store('form_files', 'public');
                            $fieldAttributes['file_path'] = $path;
                        }

                        FormField::create($fieldAttributes);
                        $globalOrder++;
                    }
                }

                return redirect()->route('admin.form.index')->with('success', 'Formulir berhasil ditambahkan.');
            });
        } catch (\Exception $e) {
            Log::error('Error di FormController::store: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->withErrors(['error' => 'Gagal menambahkan formulir: ' . $e->getMessage()]);
        }
    }

    // Menampilkan halaman untuk mengedit formulir
    public function edit(ScholarshipForm $form)
    {
        try {
            $user = Auth::user();
            $role = strtolower($user->role);

            $form->load(['scholarship:scholarship_id,name', 'fields']);

            $sections = $form->fields->groupBy('section_title')->map(function ($fields, $sectionTitle) {
                return [
                    'title' => $sectionTitle,
                    'fields' => $fields->map(function ($field) {
                        return [
                            'field_id' => $field->field_id,
                            'field_name' => $field->field_name,
                            'field_type' => $field->field_type,
                            'is_required' => $field->is_required === '1',
                            'options' => $field->options,
                            'order' => $field->order,
                            'file_path' => $field->file_path,
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
                    'sections' => $sections,
                ],
                'scholarships' => Scholarship::select('scholarship_id', 'name')->get(),
                'menu' => RoleHelper::getNavigationMenu($role),
            ]);
        } catch (\Exception $e) {
            Log::error('Error di FormController::edit: ' . $e->getMessage());
            return redirect()->route('admin.form.index')->with('error', 'Terjadi kesalahan saat memuat halaman edit formulir.');
        }
    }

    // Mengupdate formulir
    public function update(Request $request, ScholarshipForm $form)
    {
        try {
            Log::info('Attempting to update form', ['form_id' => $form->form_id]);

            $validatedData = $request->validate([
                'scholarship_id' => 'required|exists:scholarships,scholarship_id',
                'form_name' => 'required|string|max:100',
                'description' => 'nullable|string',
                'is_active' => 'required|boolean',
                'sections' => 'required|array',
                'sections.*.title' => 'required|string|max:100',
                'sections.*.fields' => 'required|array',
                'sections.*.fields.*.field_name' => 'required|string|max:100',
                'sections.*.fields.*.field_type' => 'required|in:text,number,date,dropdown,file,quill',
                'sections.*.fields.*.is_required' => 'required|boolean',
                'sections.*.fields.*.order' => 'required|string|max:3',
                'sections.*.fields.*.options' => 'nullable|string',
                'sections.*.fields.*.file' => 'nullable|file|max:10240',
                'sections.*.fields.*.field_id' => 'nullable|string|exists:form_fields,field_id',
            ]);

            Log::info('Validated data', ['data' => $validatedData]);

            return DB::transaction(function () use ($request, $validatedData, $form) {
                $user = Auth::user();

                // Update form metadata
                $form->update([
                    'scholarship_id' => $validatedData['scholarship_id'],
                    'form_name' => $validatedData['form_name'],
                    'description' => $validatedData['description'],
                    'is_active' => $validatedData['is_active'],
                    'updated_by' => $user->id,
                ]);

                // Get existing fields
                $existingFields = FormField::where('form_id', $form->form_id)->get();
                $existingFieldIds = $existingFields->pluck('field_id')->toArray();
                $submittedFieldIds = [];

                foreach ($validatedData['sections'] as $section) {
                    foreach ($section['fields'] as $field) {
                        if (isset($field['field_id']) && !empty($field['field_id'])) {
                            $submittedFieldIds[] = $field['field_id'];
                        }
                    }
                }

                // Delete fields that are no longer present and their files
                $fieldsToDelete = $existingFields->whereNotIn('field_id', array_filter($submittedFieldIds));
                foreach ($fieldsToDelete as $field) {
                    if ($field->file_path) {
                        Storage::disk('public')->delete($field->file_path);
                    }
                    $field->delete();
                }

                // Process sections and fields
                $globalOrder = 1;
                foreach ($validatedData['sections'] as $sectionIndex => $section) {
                    foreach ($section['fields'] as $fieldIndex => $fieldData) {
                        $fieldId = $fieldData['field_id'] ?? null;

                        $fieldAttributes = [
                            'form_id' => $form->form_id,
                            'section_title' => $section['title'],
                            'field_name' => $fieldData['field_name'],
                            'field_type' => $fieldData['field_type'],
                            'is_required' => $fieldData['is_required'] ? '1' : '0',
                            'options' => $fieldData['options'] ?? null,
                            'order' => $globalOrder,
                        ];

                        // Handle file upload
                        if ($fieldData['field_type'] === 'file' && $request->hasFile("sections.$sectionIndex.fields.$fieldIndex.file")) {
                            // Delete old file if exists
                            if ($fieldId && ($oldField = $existingFields->firstWhere('field_id', $fieldId)) && $oldField->file_path) {
                                Storage::disk('public')->delete($oldField->file_path);
                            }
                            $file = $request->file("sections.$sectionIndex.fields.$fieldIndex.file");
                            $fieldAttributes['file_path'] = $file->store('form_files', 'public');
                        } elseif (isset($fieldData['file_path']) && !empty($fieldData['file_path'])) {
                            $fieldAttributes['file_path'] = $fieldData['file_path'];
                        } else {
                            $fieldAttributes['file_path'] = null;
                        }

                        if ($fieldId && in_array($fieldId, $existingFieldIds)) {
                            // Update existing field
                            FormField::where('field_id', $fieldId)->update(array_merge($fieldAttributes, [
                                'updated_by' => $user->id,
                            ]));
                        } else {
                            // Generate new field_id
                            $fieldId = $this->generateId('FF', 'field_id', 'form_fields');

                            // Create new field
                            FormField::create(array_merge($fieldAttributes, [
                                'field_id' => $fieldId,
                                'created_by' => $user->id,
                                'updated_by' => $user->id,
                            ]));
                        }
                        $globalOrder++;
                    }
                }

                Log::info('Form updated successfully', ['form_id' => $form->form_id]);

                return redirect()->route('admin.form.index')->with('success', 'Formulir berhasil diperbarui.');
            });
        } catch (\Exception $e) {
            Log::error('Error di FormController::update: ' . $e->getMessage(), [
                'form_id' => $form->form_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->back()->withErrors(['error' => 'Gagal memperbarui formulir: ' . $e->getMessage()]);
        }
    }

    // Menghapus formulir
    public function destroy(ScholarshipForm $form)
    {
        try {
            Log::info('Attempting to delete form', ['form_id' => $form->form_id]);

            // Delete associated files
            $fields = FormField::where('form_id', $form->form_id)->get();
            foreach ($fields as $field) {
                if ($field->file_path) {
                    Storage::disk('public')->delete($field->file_path);
                }
            }

            $form->delete();
            Log::info('Form deleted successfully', ['form_id' => $form->form_id]);
            return redirect()->route('admin.form.index')->with('success', 'Formulir berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error in FormController::destroy', [
                'form_id' => $form->form_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('admin.form.index')->withErrors(['error' => 'Gagal menghapus formulir: ' . $e->getMessage()]);
        }
    }

    // Mengaktifkan atau menonaktifkan formulir
    public function toggleFormActive(Request $request, ScholarshipForm $form)
    {
        try {
            $user = Auth::user();

            $form->update([
                'is_active' => !$form->is_active,
                'updated_by' => $user->id,
            ]);

            $message = $form->is_active ? 'Formulir berhasil diaktifkan.' : 'Formulir berhasil dinonaktifkan.';
            return redirect()->route('admin.form.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Error di FormController::toggleFormActive: ' . $e->getMessage());
            return redirect()->route('admin.form.index')->withErrors(['error' => 'Gagal mengubah status formulir: ' . $e->getMessage()]);
        }
    }
}
