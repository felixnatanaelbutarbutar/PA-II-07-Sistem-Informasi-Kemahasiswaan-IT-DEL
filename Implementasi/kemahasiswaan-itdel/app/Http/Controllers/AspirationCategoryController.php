<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AspirationCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class AspirationCategoryController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $categories = AspirationCategory::with(['aspirations'])->get();

        return Inertia::render('Admin/AspirationCategory/index', [
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

        return Inertia::render('Admin/AspirationCategory/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        try {
            Log::debug('Creating aspiration category', [
                'name' => $request->name,
                'created_by' => $user->id,
            ]);

            AspirationCategory::create([
                'name' => $request->name,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating aspiration category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create aspiration category: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.aspiration-category.index')
            ->with('success', 'Kategori aspirasi berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $category = AspirationCategory::findOrFail($id);

        return Inertia::render('Admin/AspirationCategory/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'category' => $category,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        try {
            $category = AspirationCategory::findOrFail($id);

            Log::debug('Updating aspiration category', [
                'id' => $id,
                'name' => $request->name,
            ]);

            $category->update([
                'name' => $request->name,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating aspiration category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update aspiration category: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.aspiration-category.index')
            ->with('success', 'Kategori aspirasi berhasil diperbarui!');
    }

    public function destroy($id)
    {
        try {
            $category = AspirationCategory::findOrFail($id);
            $category->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting aspiration category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete aspiration category: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.aspiration-category.index')
            ->with('success', 'Kategori aspirasi berhasil dihapus!');
    }

    public function getCategoriesWithAspirations()
    {
        $categories = AspirationCategory::with(['aspirations'])->get();
        return response()->json($categories);
    }
}
