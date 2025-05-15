<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\NewsCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class NewsCategoryController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $categories = NewsCategory::with(['creator', 'updater'])->get();

        return Inertia::render('Admin/NewsCategory/index', [
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

        return Inertia::render('Admin/NewsCategory/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $user = Auth::user();
        $role = strtolower($user->role);

        $categoryId = $this->generateCategoryId();

        try {
            Log::debug('Creating news category', [
                'category_id' => $categoryId,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            NewsCategory::create([
                'category_id' => $categoryId,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'created_by' => Auth::id(), // Set created_by to the authenticated user's ID
                'updated_by' => Auth::id(), // Set updated_by to the authenticated user's ID
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating news category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create news category: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.news-category.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function edit($category_id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $category = NewsCategory::findOrFail($category_id);

        return Inertia::render('Admin/NewsCategory/edit', [
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
            'category_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            $category = NewsCategory::findOrFail($category_id);

            Log::debug('Updating news category', [
                'category_id' => $category_id,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'updated_by' => Auth::id(),
            ]);

            $category->update([
                'category_name' => $request->category_name,
                'description' => $request->description,
                'updated_by' => Auth::id(), // Update updated_by with the authenticated user's ID
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating news category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update news category: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.news-category.index')
            ->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy($category_id)
    {
        try {
            $category = NewsCategory::findOrFail($category_id);
            $category->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting news category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete news category: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.news-category.index')
            ->with('success', 'Kategori berhasil dihapus!');
    }

    /**
     * Generate a unique ID for category_id
     */
    private function generateCategoryId()
    {
        $lastCategory = NewsCategory::latest('category_id')->first();

        if ($lastCategory) {
            $lastIdNumber = (int) substr($lastCategory->category_id, 3);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'nc' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }
}
