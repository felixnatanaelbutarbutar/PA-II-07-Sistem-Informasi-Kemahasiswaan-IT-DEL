<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Helpers\RoleHelper;
use App\Models\Scholarship;
use Illuminate\Http\Request;
use App\Models\ScholarshipForm;
use Barryvdh\DomPDF\Facade\PDF;
use App\Models\ScholarshipCategory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Traits\FormActivityTrait;

class ScholarshipController extends Controller
{
    use FormActivityTrait;

    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
        }

        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $status = $request->query('status');
        $sortBy = $request->query('sort_by', 'updated_at');
        $sortDirection = $request->query('sort_direction', 'desc');
        $search = $request->query('search');

        $query = Scholarship::with(['category', 'creator', 'updater']);

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        if ($search) {
            $searchTerms = array_filter(explode(' ', trim($search)));
            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $lowerTerm = strtolower($term);
                    $q->orWhereRaw('LOWER(name) LIKE ?', ['%' . $lowerTerm . '%'])
                        ->orWhereRaw('LOWER(description) LIKE ?', ['%' . $lowerTerm . '%'])
                        ->orWhereHas('category', function ($q) use ($lowerTerm) {
                            $q->whereRaw('LOWER(category_name) LIKE ?', ['%' . $lowerTerm . '%']);
                        });
                }
            });
        }

        if ($sortBy === 'updated_at') {
            $query->orderBy('is_active', 'desc')
                ->orderBy('updated_at', $sortDirection);
        }

        $scholarships = $query->get()->map(function ($scholarship) {
            return [
                'scholarship_id' => $scholarship->scholarship_id,
                'name' => $scholarship->name,
                'description' => $scholarship->description,
                'poster' => $scholarship->poster ? Storage::url($scholarship->poster) : null,
                'category_id' => $scholarship->category_id,
                'category_name' => $scholarship->category ? $scholarship->category->category_name : null,
                'is_active' => $scholarship->is_active,
                'status' => $scholarship->is_active ? 'Aktif' : 'Non-Aktif',
                'created_by' => $scholarship->creator ? $scholarship->creator->name : null,
                'updated_by' => $scholarship->updater ? $scholarship->updater->name : null,
                'created_at' => $scholarship->created_at->toDateTimeString(),
                'updated_at' => $scholarship->updated_at->toDateTimeString(),
            ];
        });

        return Inertia::render('Admin/Scholarship/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'scholarships' => $scholarships,
            'filters' => [
                'status' => $status,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
        }

        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        $categories = ScholarshipCategory::where('is_active', true)->get();

        return Inertia::render('Admin/Scholarship/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'poster' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'category_id' => 'required|exists:scholarship_categories,category_id',
            'is_active' => 'sometimes|boolean',
        ]);

        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
        }

        $scholarshipId = $this->generateScholarshipId();

        try {
            $posterPath = null;
            if ($request->hasFile('poster')) {
                $posterPath = $request->file('poster')->store('scholarship_posters', 'public');
            }

            Scholarship::create([
                'scholarship_id' => $scholarshipId,
                'name' => $request->name,
                'description' => $request->description,
                'poster' => $posterPath,
                'category_id' => $request->category_id,
                'is_active' => $request->is_active ?? true,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            return redirect()->route('admin.scholarship.index')
                ->with('success', 'Beasiswa berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Error creating scholarship: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal membuat beasiswa: ' . $e->getMessage()])->withInput();
        }
    }

    public function edit(Scholarship $scholarship)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
        }

        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        $categories = ScholarshipCategory::where('is_active', true)->get();

        return Inertia::render('Admin/Scholarship/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'scholarship' => [
                'scholarship_id' => $scholarship->scholarship_id,
                'name' => $scholarship->name,
                'description' => $scholarship->description,
                'poster' => $scholarship->poster ? Storage::url($scholarship->poster) : null,
                'category_id' => $scholarship->category_id,
                'is_active' => $scholarship->is_active,
                'status' => $scholarship->is_active ? 'Aktif' : 'Non-Aktif',
            ],
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Scholarship $scholarship)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'poster' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'category_id' => 'required|exists:scholarship_categories,category_id',
            'is_active' => 'sometimes|boolean',
        ]);

        try {
            $posterPath = $scholarship->poster;
            if ($request->hasFile('poster')) {
                if ($scholarship->poster) {
                    Storage::disk('public')->delete($scholarship->poster);
                }
                $posterPath = $request->file('poster')->store('scholarship_posters', 'public');
            }

            $scholarship->update([
                'name' => $request->name,
                'description' => $request->description,
                'poster' => $posterPath,
                'category_id' => $request->category_id,
                'is_active' => $request->is_active ?? $scholarship->is_active,
                'updated_by' => Auth::id(),
            ]);

            return redirect()->route('admin.scholarship.index')
                ->with('success', 'Beasiswa berhasil diperbarui!');
        } catch (\Exception $e) {
            Log::error('Error updating scholarship: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui beasiswa: ' . $e->getMessage()])->withInput();
        }
    }

    public function destroy(Scholarship $scholarship)
    {
        try {
            if ($scholarship->poster) {
                Storage::disk('public')->delete($scholarship->poster);
            }
            $scholarship->delete();

            return redirect()->route('admin.scholarship.index')
                ->with('success', 'Beasiswa berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Error deleting scholarship: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus beasiswa: ' . $e->getMessage()]);
        }
    }

    public function toggleActive(Request $request, $scholarship_id)
    {
        try {
            $scholarship = Scholarship::where('scholarship_id', $scholarship_id)->firstOrFail();
            $oldStatus = $scholarship->is_active;
            $newStatus = !$scholarship->is_active;

            Log::debug('Toggling scholarship status', [
                'scholarship_id' => $scholarship_id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'updated_by' => Auth::id(),
            ]);

            $scholarship->update([
                'is_active' => $newStatus,
                'updated_by' => Auth::id(),
            ]);

            Log::debug('Scholarship updated', [
                'scholarship_id' => $scholarship_id,
                'is_active' => $scholarship->fresh()->is_active,
            ]);

            $message = $newStatus ? 'Beasiswa berhasil diaktifkan.' : 'Beasiswa berhasil dinonaktifkan.';

            if ($request->header('X-Inertia')) {
                $user = Auth::user();
                $role = strtolower($user->role);
                $menuItems = RoleHelper::getNavigationMenu($role);
                $permissions = RoleHelper::getRolePermissions($role);

                $scholarships = Scholarship::with(['category', 'creator', 'updater'])->get()->map(function ($scholarship) {
                    return [
                        'scholarship_id' => $scholarship->scholarship_id,
                        'name' => $scholarship->name,
                        'description' => $scholarship->description,
                        'poster' => $scholarship->poster ? Storage::url($scholarship->poster) : null,
                        'category_id' => $scholarship->category_id,
                        'category_name' => $scholarship->category ? $scholarship->category->category_name : null,
                        'is_active' => $scholarship->is_active,
                        'status' => $scholarship->is_active ? 'Aktif' : 'Non-Aktif',
                        'created_by' => $scholarship->creator ? $scholarship->creator->name : null,
                        'updated_by' => $scholarship->updater ? $scholarship->updater->name : null,
                        'created_at' => $scholarship->created_at->toDateTimeString(),
                        'updated_at' => $scholarship->updated_at->toDateTimeString(),
                    ];
                });

                return Inertia::render('Admin/Scholarship/index', [
                    'auth' => ['user' => $user],
                    'userRole' => $role,
                    'permissions' => $permissions,
                    'menu' => $menuItems,
                    'scholarships' => $scholarships,
                    'filters' => [
                        'status' => $request->query('status'),
                        'sort_by' => $request->query('sort_by', 'updated_at'),
                        'sort_direction' => $request->query('sort_direction', 'desc'),
                        'search' => $request->query('search'),
                    ],
                    'flash' => ['success' => $message],
                ]);
            }

            return redirect()->route('admin.scholarship.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Error toggling scholarship status: ' . $e->getMessage(), [
                'scholarship_id' => $scholarship_id,
                'user_id' => Auth::id(),
            ]);
            if ($request->header('X-Inertia')) {
                return Inertia::render('Admin/Scholarship/index', [
                    'flash' => ['error' => 'Failed to toggle scholarship status: ' . $e->getMessage()],
                ])->withStatus(422);
            }
            return back()->withErrors(['error' => 'Failed to toggle scholarship status: ' . $e->getMessage()]);
        }
    }

    private function generateScholarshipId()
    {
        $lastScholarship = Scholarship::latest('scholarship_id')->first();
        $newIdNumber = $lastScholarship ? (int) substr($lastScholarship->scholarship_id, 3) + 1 : 1;
        return 'sch' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }

    public function guestIndex()
    {
        try {
            $scholarships = Scholarship::with([
                'category',
                'forms.settings' // Eager-load forms and their settings
            ])
                ->where('is_active', true)
                ->get();

            Log::info('Scholarships fetched in guestIndex', [
                'count' => $scholarships->count(),
                'sample' => $scholarships->take(1)->toArray(),
            ]);

            return Inertia::render('ScholarshipIndex', [
                'scholarships' => $scholarships->map(function ($scholarship) {
                    // Get the first form (or null if no forms exist)
                    $form = $scholarship->forms->first();
                    // Get form settings (or null if no settings exist)
                    $settings = $form ? $form->settings : null;

                    return [
                        'scholarship_id' => $scholarship->scholarship_id,
                        'name' => $scholarship->name ?? '-',
                        'description' => $scholarship->description ?? '-',
                        'poster' => $scholarship->poster ? Storage::url($scholarship->poster) : null,
                        'category_id' => $scholarship->category_id ?? '-',
                        'category_name' => $scholarship->category ? $scholarship->category->category_name ?? '-' : '-',
                        // Map submission_start and submission_deadline from form_settings
                        'submission_start' => $settings ? $settings->submission_start?->toDateTimeString() : '-',
                        'submission_deadline' => $settings ? $settings->submission_deadline?->toDateTimeString() : '-',
                    ];
                }),
                'auth' => ['user' => Auth::user()],
                'userRole' => Auth::check() ? strtolower(Auth::user()->role) : 'guest',
                'flash' => session()->only(['success', 'error']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in ScholarshipController::guestIndex: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('home')->with('error', 'Gagal memuat daftar beasiswa. Silakan coba lagi nanti.');
        }
    }

    public function guestShow($scholarship_id)
    {
        try {
            $scholarship = Scholarship::with('category')
                ->where('scholarship_id', $scholarship_id)
                ->where('is_active', true)
                ->firstOrFail();

            // Fetch the first form associated with the scholarship
            $form = ScholarshipForm::with(['fields', 'settings'])
                ->where('scholarship_id', $scholarship_id)
                ->first();

            // Determine form activity status
            $isFormActive = $form ? $this->isFormActive($form->settings) : false;

            $formData = $form ? [
                'form_id' => $form->form_id,
                'form_name' => $form->form_name,
                'description' => $form->description,
                'is_active' => $isFormActive,
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
                                'is_active' => (bool) $field->is_active,
                            ];
                        })->sortBy('order')->values()->toArray(),
                    ];
                })->values(),
            ] : null;

            return Inertia::render('ScholarshipDetail', [
                'auth' => ['user' => Auth::user()],
                'userRole' => Auth::check() ? strtolower(Auth::user()->role) : 'guest',
                'scholarship' => [
                    'scholarship_id' => $scholarship->scholarship_id,
                    'name' => $scholarship->name ?? '-',
                    'description' => $scholarship->description ?? '-',
                    'poster' => $scholarship->poster ? Storage::url($scholarship->poster) : null,
                    'category_id' => $scholarship->category_id ?? '-',
                    'category_name' => $scholarship->category ? $scholarship->category->category_name ?? '-' : '-',
                ],
                'form' => $formData,
                'flash' => session()->only(['success', 'error']),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Scholarship not found in ScholarshipController::guestShow: ' . $e->getMessage(), [
                'scholarship_id' => $scholarship_id,
            ]);
            return redirect()->route('scholarships.index')->with('error', 'Beasiswa tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Error in ScholarshipController::guestShow: ' . $e->getMessage(), [
                'scholarship_id' => $scholarship_id,
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('scholarships.index')->with('error', 'Gagal memuat detail beasiswa: ' . $e->getMessage());
        }
    }

    public function exportPDF(Request $request)
    {
        try {
            $search = $request->query('search');
            $status = $request->query('status');
            $sortBy = $request->query('sort_by', 'updated_at');
            $sortDirection = $request->query('sort_direction', 'desc');

            $query = Scholarship::with(['category', 'creator', 'updater']);

            if ($search) {
                $searchTerms = array_filter(explode(' ', trim($search)));
                $query->where(function ($q) use ($searchTerms) {
                    foreach ($searchTerms as $term) {
                        $lowerTerm = strtolower($term);
                        $q->orWhereRaw('LOWER(name) LIKE ?', ['%' . $lowerTerm . '%'])
                            ->orWhereRaw('LOWER(description) LIKE ?', ['%' . $lowerTerm . '%'])
                            ->orWhereHas('category', function ($q) use ($lowerTerm) {
                                $q->whereRaw('LOWER(category_name) LIKE ?', ['%' . $lowerTerm . '%']);
                            });
                    }
                });
            }

            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }

            if ($sortBy === 'updated_at') {
                $query->orderBy('is_active', 'desc')
                    ->orderBy('updated_at', $sortDirection);
            }

            $scholarships = $query->get()->map(function ($scholarship) {
                return [
                    'scholarship_id' => $scholarship->scholarship_id,
                    'name' => $scholarship->name,
                    'description' => $scholarship->description,
                    'category_name' => $scholarship->category ? $scholarship->category->category_name : null,
                    'status' => $scholarship->is_active ? 'Aktif' : 'Non-Aktif',
                    'created_by' => $scholarship->creator ? $scholarship->creator->name : null,
                    'updated_at' => $scholarship->updated_at->toDateString(),
                ];
            });

            $pdf = PDF::loadView('pdf.scholarships', compact('scholarships'));
            return $pdf->download('beasiswa.pdf');
        } catch (\Exception $e) {
            Log::error('Error generating PDF: ' . $e->getMessage());
            return redirect()->route('admin.scholarship.index')
                ->with('error', 'Gagal menghasilkan PDF: ' . $e->getMessage());
        }
    }
}