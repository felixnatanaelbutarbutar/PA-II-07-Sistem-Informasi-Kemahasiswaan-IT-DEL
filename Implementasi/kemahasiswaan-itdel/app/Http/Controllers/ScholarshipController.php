<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use App\Models\ScholarshipCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class ScholarshipController extends Controller
{
    /**
     * Display a listing of scholarships.
     */
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $scholarships = Scholarship::with(['category', 'creator', 'updater'])->get();

        return Inertia::render('Admin/Scholarship/Index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'scholarships' => $scholarships,
        ]);
    }

    /**
     * Show the form for creating a new scholarship.
     */
    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        $categories = ScholarshipCategory::all(); // Untuk dropdown kategori

        return Inertia::render('Admin/Scholarship/Add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created scholarship in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'poster' => 'nullable|string', // Ganti ke 'image|max:2048' jika upload file
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_id' => 'required|exists:scholarship_categories,category_id',
        ]);

        $user = Auth::user();
        $scholarshipId = $this->generateScholarshipId();

        try {
            Log::debug('Creating scholarship', [
                'scholarship_id' => $scholarshipId,
                'name' => $request->name,
                'description' => $request->description,
                'poster' => $request->poster,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'category_id' => $request->category_id,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            Scholarship::create([
                'scholarship_id' => $scholarshipId,
                'name' => $request->name,
                'description' => $request->description,
                'poster' => $request->poster, // Default ditangani di model via accessor
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'category_id' => $request->category_id,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            return redirect()->route('Scholarship.index')
                            ->with('success', 'Beasiswa berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Error creating scholarship: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create scholarship: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified scholarship.
     */
    public function show($id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $scholarship = Scholarship::with(['category', 'creator', 'updater'])->findOrFail($id);

        return Inertia::render('Admin/Scholarship/Show', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'scholarship' => $scholarship,
        ]);
    }

    /**
     * Show the form for editing the specified scholarship.
     */
    public function edit($scholarship_id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $scholarship = Scholarship::findOrFail($scholarship_id);
        $categories = ScholarshipCategory::all();

        return Inertia::render('Admin/Scholarship/Edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'scholarship' => $scholarship,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified scholarship in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'poster' => 'nullable|string', // Ganti ke 'image|max:2048' jika upload file
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_id' => 'required|exists:scholarship_categories,category_id',
        ]);

        try {
            $scholarship = Scholarship::findOrFail($id);

            Log::debug('Updating scholarship', [
                'id' => $id,
                'name' => $request->name,
                'description' => $request->description,
                'poster' => $request->poster,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'category_id' => $request->category_id,
                'updated_by' => Auth::user()->id,
            ]);

            $scholarship->update([
                'name' => $request->name,
                'description' => $request->description,
                'poster' => $request->poster, // Default ditangani di model via accessor
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'category_id' => $request->category_id,
                'updated_by' => Auth::user()->id,
            ]);

            return redirect()->route('admin.Scholarship.index')
                            ->with('success', 'Beasiswa berhasil diperbarui!');
        } catch (\Exception $e) {
            Log::error('Error updating scholarship: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update scholarship: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Remove the specified scholarship from storage.
     */
    public function destroy($scholarship_id)
    {
        try {
            $scholarship = Scholarship::where('scholarship_id', $scholarship_id)->firstOrFail();
            $scholarship->delete();

            return redirect()->route('admin.Scholarship.index')
                            ->with('success', 'Beasiswa berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Error deleting scholarship: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus beasiswa: ' . $e->getMessage());
        }
    }

    /**
     * Generate a unique ID for scholarship_id.
     */
    private function generateScholarshipId()
    {
        $lastScholarship = Scholarship::latest('scholarship_id')->first();

        if ($lastScholarship) {
            $lastIdNumber = (int) substr($lastScholarship->scholarship_id, 2); // Ambil angka setelah 'sb'
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'sb' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT); // Format: sb001
    }
}
