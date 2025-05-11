<?php

namespace App\Http\Controllers;

use App\Models\DownloadCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Helpers\RoleHelper;

class DownloadCategoryController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $categories = DownloadCategory::with(['created_by', 'updated_by'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/DownloadCategory/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/DownloadCategory/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:download_categories,name',
            'description' => 'nullable|string',
        ]);

        $user = Auth::user();

        DownloadCategory::create([
            'name' => $request->name,
            'description' => $request->description,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        return redirect()->route('admin.download-categories.index')->with('success', 'Kategori unduhan berhasil ditambahkan.');
    }

    public function edit(DownloadCategory $downloadCategory)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/DownloadCategory/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
            'category' => $downloadCategory,
        ]);
    }

    public function update(Request $request, DownloadCategory $downloadCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:download_categories,name,' . $downloadCategory->id,
            'description' => 'nullable|string',
        ]);

        $user = Auth::user();

        $downloadCategory->update([
            'name' => $request->name,
            'description' => $request->description,
            'updated_by' => $user->id,
        ]);

        return redirect()->route('admin.download-categories.index')->with('success', 'Kategori unduhan berhasil diperbarui.');
    }

    public function destroy(DownloadCategory $downloadCategory)
    {
        $downloadCategory->delete();

        return redirect()->route('admin.download-categories.index')->with('success', 'Kategori unduhan berhasil dihapus.');
    }
}