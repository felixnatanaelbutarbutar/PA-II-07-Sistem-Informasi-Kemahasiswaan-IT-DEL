<?php

namespace App\Http\Controllers;

use App\Models\AnnouncementCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class AnnouncementCategoryController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $categories = AnnouncementCategory::with(['creator', 'updater'])->get();

        return Inertia::render('Admin/AnnouncementCategory/index', [
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

        return Inertia::render('Admin/AnnouncementCategory/add', [
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
        $categoryId = $this->generateCategoryId();

        try {
            Log::debug('Creating announcement category', [
                'category_id' => $categoryId,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            AnnouncementCategory::create([
                'category_id' => $categoryId,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating announcement category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menambahkan kategori pengumuman: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.announcement-category.index')
            ->with('success', 'Kategori pengumuman berhasil ditambahkan.');
    }

    public function edit($category_id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $category = AnnouncementCategory::findOrFail($category_id);

        return Inertia::render('Admin/AnnouncementCategory/edit', [
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
            $category = AnnouncementCategory::findOrFail($category_id);

            Log::debug('Updating announcement category', [
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
            Log::error('Error updating announcement category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui kategori pengumuman: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.announcement-category.index')
            ->with('success', 'Kategori pengumuman berhasil diperbarui!');
    }

    public function destroy($category_id)
    {
        try {
            $category = AnnouncementCategory::findOrFail($category_id);
            $category->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting announcement category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus kategori pengumuman: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.announcement-category.index')
            ->with('success', 'Kategori pengumuman berhasil dihapus!');
    }

    private function generateCategoryId()
    {
        $lastCategory = AnnouncementCategory::latest('category_id')->first();

        if ($lastCategory) {
            $lastIdNumber = (int) substr($lastCategory->category_id, 3);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'ac' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT); // ac = announcement category
    }
}
