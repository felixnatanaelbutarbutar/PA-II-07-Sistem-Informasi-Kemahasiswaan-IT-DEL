<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Helpers\RoleHelper;
use App\Models\Scholarship;
use Illuminate\Http\Request;
use App\Models\ScholarshipCategory;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ScholarshipController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $scholarships = Scholarship::with(['category', 'creator', 'updater'])->get();

        return Inertia::render('Admin/Scholarship/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'scholarships' => $scholarships,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        $categories = ScholarshipCategory::all();

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
            'description' => 'nullable|string',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4048',
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
                'poster' => $request->poster,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'category_id' => $request->category_id,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating scholarship: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create scholarship: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.scholarship.index')
            ->with('success', 'Beasiswa berhasil ditambahkan.');
    }

    public function edit($scholarship_id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $scholarship = Scholarship::findOrFail($scholarship_id);
        $categories = ScholarshipCategory::all();

        return Inertia::render('Admin/Scholarship/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'scholarship' => $scholarship,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, $scholarship_id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:4048',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_id' => 'required|exists:scholarship_categories,category_id',
        ]);

        try {
            $scholarship = Scholarship::findOrFail($scholarship_id);

            Log::debug('Updating scholarship', [
                'scholarship_id' => $scholarship_id,
                'name' => $request->name,
                'description' => $request->description,
                'poster' => $request->poster,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'category_id' => $request->category_id,
                'updated_by' => Auth::id(),
            ]);

            $scholarship->update([
                'name' => $request->name,
                'description' => $request->description,
                'poster' => $request->poster,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'category_id' => $request->category_id,
                'updated_by' => Auth::id(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating scholarship: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update scholarship: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.scholarship.index')
            ->with('success', 'Beasiswa berhasil diperbarui!');
    }

    public function destroy($scholarship_id)
    {
        try {
            $scholarship = Scholarship::findOrFail($scholarship_id);
            $scholarship->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting scholarship: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete scholarship: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.scholarship.index')
            ->with('success', 'Beasiswa berhasil dihapus!');
    }

    private function generateScholarshipId()
    {
        $lastScholarship = Scholarship::latest('scholarship_id')->first();

        if ($lastScholarship) {
            $lastIdNumber = (int) substr($lastScholarship->scholarship_id, 2);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'sch' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }

    public function guestIndex()
    {
        $scholarships = Scholarship::with(['category', 'form'])
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->get()
            ->map(function ($scholarship) {
                return [
                    'scholarship_id' => $scholarship->scholarship_id,
                    'name' => $scholarship->name,
                    'description' => $scholarship->description,
                    'poster' => $scholarship->poster ? Storage::url($scholarship->poster) : null,
                    'start_date' => $scholarship->start_date,
                    'end_date' => $scholarship->end_date,
                    'category_name' => $scholarship->category ? $scholarship->category->category_name : null,
                    'form' => $scholarship->form ? [
                        'form_id' => $scholarship->form->form_id,
                        'is_active' => $scholarship->form->is_active,
                    ] : null,
                ];
            });

        return Inertia::render('Scholarship', [
            'scholarships' => $scholarships,
        ]);
    }

    public function show($scholarship_id)
    {
        $scholarship = Scholarship::with(['category', 'form', 'creator'])
            ->where('scholarship_id', $scholarship_id)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->firstOrFail();

        return Inertia::render('ScholarshipDetail', [
            'scholarship' => [
                'scholarship_id' => $scholarship->scholarship_id,
                'name' => $scholarship->name,
                'description' => $scholarship->description,
                'poster' => $scholarship->poster ? Storage::url($scholarship->poster) : null,
                'start_date' => $scholarship->start_date,
                'end_date' => $scholarship->end_date,
                'category_name' => $scholarship->category ? $scholarship->category->category_name : null,
                'created_by' => $scholarship->creator ? $scholarship->creator->name : 'Unknown',
                'form' => $scholarship->form ? [
                    'form_id' => $scholarship->form->form_id,
                    'is_active' => $scholarship->form->is_active,
                ] : null,
            ],
        ]);
    }
}
