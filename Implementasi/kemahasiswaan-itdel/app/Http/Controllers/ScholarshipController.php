<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use App\Models\ScholarshipCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\PDF;

class ScholarshipController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
        }

        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        // Get query parameters for filtering and searching
        $status = $request->query('status'); // 'active', 'inactive', or null
        $sortBy = $request->query('sort_by', 'updated_at'); // Default to updated_at
        $sortDirection = $request->query('sort_direction', 'desc'); // Default to desc
        $search = $request->query('search');

        $query = Scholarship::with(['category', 'creator', 'updater']);

        // Apply status filter
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        // Apply case-insensitive search on name, description, and category_name
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

        // Apply sorting
        if ($sortBy === 'updated_at') {
            $query->orderBy('is_active', 'desc') // Prioritize active status
                  ->orderBy('updated_at', $sortDirection);
        }

        $scholarships = $query->get()->map(function ($scholarship) {
            return [
                'scholarship_id' => $scholarship->scholarship_id,
                'name' => $scholarship->name,
                'description' => $scholarship->description,
                'poster' => $scholarship->poster ? Storage::url($scholarship->poster) : null,
                'start_date' => $scholarship->start_date ? $scholarship->start_date->toDateString() : null,
                'end_date' => $scholarship->end_date ? $scholarship->end_date->toDateString() : null,
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
            'poster' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
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
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
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
                'start_date' => $scholarship->start_date ? $scholarship->start_date->toDateString() : null,
                'end_date' => $scholarship->end_date ? $scholarship->end_date->toDateString() : null,
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
            'poster' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
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
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
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
                        'start_date' => $scholarship->start_date ? $scholarship->start_date->toDateString() : null,
                        'end_date' => $scholarship->end_date ? $scholarship->end_date->toDateString() : null,
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
        $scholarships = Scholarship::with('category')
            ->where('is_active', true)
            ->get()
            ->map(function ($scholarship) {
                return [
                    'scholarship_id' => $scholarship->scholarship_id,
                    'name' => $scholarship->name,
                    'description' => $scholarship->description,
                    'poster' => $scholarship->poster ? Storage::url($scholarship->poster) : null,
                    'start_date' => $scholarship->start_date ? $scholarship->start_date->toDateString() : null,
                    'end_date' => $scholarship->end_date ? $scholarship->end_date->toDateString() : null,
                    'category_id' => $scholarship->category_id,
                    'category' => $scholarship->category ? [
                        'category_id' => $scholarship->category->category_id,
                        'category_name' => $scholarship->category->category_name,
                    ] : null,
                    'is_active' => $scholarship->is_active,
                ];
            });

        return Inertia::render('Scholarship', [
            'scholarships' => $scholarships,
        ]);
    }

    public function guestShow($scholarship_id)
    {
        try {
            $scholarship = Scholarship::with('category')
                ->where('scholarship_id', $scholarship_id)
                ->where('is_active', true)
                ->firstOrFail();

            return Inertia::render('ScholarshipShow', [
                'scholarship' => [
                    'scholarship_id' => $scholarship->scholarship_id,
                    'name' => $scholarship->name,
                    'description' => $scholarship->description,
                    'poster' => $scholarship->poster ? Storage::url($scholarship->poster) : null,
                    'start_date' => $scholarship->start_date ? $scholarship->start_date->toDateString() : null,
                    'end_date' => $scholarship->end_date ? $scholarship->end_date->toDateString() : null,
                    'category_id' => $scholarship->category_id,
                    'category' => $scholarship->category ? [
                        'category_id' => $scholarship->category->category_id,
                        'category_name' => $scholarship->category->category_name,
                    ] : null,
                    'is_active' => $scholarship->is_active,
                    'status' => $scholarship->is_active ? 'Aktif' : 'Non-Aktif',
                ],
            ]);
        } catch (\Exception $e) {
            return redirect()->route('guest.scholarship.index')
                ->with('error', 'Beasiswa tidak ditemukan.');
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
                    'start_date' => $scholarship->start_date ? $scholarship->start_date->toDateString() : null,
                    'end_date' => $scholarship->end_date ? $scholarship->end_date->toDateString() : null,
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
