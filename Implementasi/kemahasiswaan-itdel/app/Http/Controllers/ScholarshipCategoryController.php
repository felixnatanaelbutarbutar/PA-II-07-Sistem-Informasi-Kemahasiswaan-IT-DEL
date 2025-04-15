<?php

namespace App\Http\Controllers;

use App\Models\ScholarshipCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class ScholarshipCategoryController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $categories = ScholarshipCategory::with(['creator', 'updater'])->get();

        return Inertia::render('Admin/ScholarshipCategory/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/ScholarshipCategory/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_name' => 'required|string|max:255|unique:scholarship_categories,category_name',
            'description' => 'nullable|string',
        ]);

        $categoryId = $this->generateCategoryId();

        try {
            Log::debug('Creating scholarship category', [
                'category_id' => $categoryId,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            ScholarshipCategory::create([
                'category_id' => $categoryId,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating scholarship category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create scholarship category: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.scholarship-category.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function edit($category_id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $category = ScholarshipCategory::findOrFail($category_id);

        return Inertia::render('Admin/ScholarshipCategory/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'category' => $category,
        ]);
    }

    public function update(Request $request, $category_id)
    {
        $request->validate([
            'category_name' => 'required|string|max:255|unique:scholarship_categories,category_name,' . $category_id . ',category_id',
            'description' => 'nullable|string',
        ]);

        try {
            $category = ScholarshipCategory::findOrFail($category_id);

            Log::debug('Updating scholarship category', [
                'category_id' => $category_id,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'updated_by' => Auth::id(),
            ]);

            $category->update([
                'category_name' => $request->category_name,
                'description' => $request->description,
                'updated_by' => Auth::id(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating scholarship category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update scholarship category: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.scholarship-category.index')
            ->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy($category_id)
    {
        try {
            $category = ScholarshipCategory::findOrFail($category_id);
            $category->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting scholarship category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete scholarship category: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.scholarship-category.index')
            ->with('success', 'Kategori berhasil dihapus!');
    }

    /**
     * Generate a unique ID for category_id
     */
    private function generateCategoryId()
    {
        $lastCategory = ScholarshipCategory::latest('category_id')->first();

        if ($lastCategory) {
            $lastIdNumber = (int) substr($lastCategory->category_id, 2);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'sc' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }
}
