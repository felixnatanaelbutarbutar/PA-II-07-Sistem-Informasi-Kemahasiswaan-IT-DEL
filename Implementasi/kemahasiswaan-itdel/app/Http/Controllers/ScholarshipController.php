<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Scholarship;
use App\Models\ScholarshipCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\PDF; // Tambahkan ini untuk PDF

class ScholarshipController extends Controller
{
    public function index(Request $request)
    {
        // Pastikan user sudah login
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu.');
        }

        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        // Ambil parameter filter dari request
        $search = $request->query('search');
        $status = $request->query('status');
        $dateFilter = $request->query('date_filter', 'terbaru');

        // Query dasar untuk scholarships
        $query = Scholarship::with(['category', 'creator', 'updater']);

        // Filter berdasarkan pencarian
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhereHas('category', function ($q) use ($search) {
                      $q->where('category_name', 'like', '%' . $search . '%');
                  });
            });
        }

        // Filter berdasarkan status
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        // Sorting berdasarkan tanggal (Terlama/Terbaru)
        if ($dateFilter === 'terlama') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Ambil data scholarships dengan pagination
        $scholarships = $query->paginate(10)->through(function ($scholarship) {
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
                'created_by' => $scholarship->creator ? $scholarship->creator->name : 'Unknown',
                'updated_by' => $scholarship->updater ? $scholarship->updater->name : 'Unknown',
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
                'search' => $search,
                'status' => $status,
                'date_filter' => $dateFilter,
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
                ->with('success', 'Beasiswa berhasil dit今年的。');
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
            $scholarship->update([
                'is_active' => !$scholarship->is_active,
                'updated_by' => Auth::id(),
            ]);

            return redirect()->route('admin.scholarship.index')
                ->with('success', $scholarship->is_active ? 'Beasiswa berhasil diaktifkan.' : 'Beasiswa berhasil dinonaktifkan.');
        } catch (\Exception $e) {
            Log::error('Error toggling scholarship status: ' . $e->getMessage());
            return redirect()->route('admin.scholarship.index')
                ->with('error', 'Gagal mengubah status beasiswa: ' . $e->getMessage());
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
            // Ambil filter dari request (sama seperti index)
            $search = $request->query('search');
            $status = $request->query('status');
            $dateFilter = $request->query('date_filter', 'terbaru');

            // Query dasar untuk scholarships
            $query = Scholarship::with(['category', 'creator', 'updater']);

            // Filter berdasarkan pencarian
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhereHas('category', function ($q) use ($search) {
                          $q->where('category_name', 'like', '%' . $search . '%');
                      });
                });
            }

            // Filter berdasarkan status
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }

            // Sorting berdasarkan tanggal
            if ($dateFilter === 'terlama') {
                $query->orderBy('created_at', 'asc');
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Ambil data
            $scholarships = $query->get()->map(function ($scholarship) {
                return [
                    'scholarship_id' => $scholarship->scholarship_id,
                    'name' => $scholarship->name,
                    'description' => $scholarship->description,
                    'start_date' => $scholarship->start_date ? $scholarship->start_date->toDateString() : null,
                    'end_date' => $scholarship->end_date ? $scholarship->end_date->toDateString() : null,
                    'category_name' => $scholarship->category ? $scholarship->category->category_name : null,
                    'status' => $scholarship->is_active ? 'Aktif' : 'Non-Aktif',
                    'created_by' => $scholarship->creator ? $scholarship->creator->name : 'Unknown',
                    'updated_at' => $scholarship->updated_at->toDateString(),
                ];
            });

            // Load view untuk PDF
            $pdf = PDF::loadView('pdf.scholarships', compact('scholarships'));
            return $pdf->download('beasiswa.pdf');
        } catch (\Exception $e) {
            Log::error('Error generating PDF: ' . $e->getMessage());
            return redirect()->route('admin.scholarship.index')
                ->with('error', 'Gagal menghasilkan PDF: ' . $e->getMessage());
        }
    }
}
