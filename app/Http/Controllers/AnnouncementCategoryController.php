<?php

namespace App\Http\Controllers;

use App\Models\AnnouncementCategory;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

class AnnouncementCategoryController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $status = $request->query('status');
        $sortBy = $request->query('sort_by', 'updated_at');
        $sortDirection = $request->query('sort_direction', 'desc');
        $search = $request->query('search');

        $query = AnnouncementCategory::with(['creator', 'updater']);

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
                    $q->orWhereRaw('LOWER(category_name) LIKE ?', ['%' . $lowerTerm . '%'])
                      ->orWhereRaw('LOWER(description) LIKE ?', ['%' . $lowerTerm . '%']);
                }
            });
        }

        if ($sortBy === 'updated_at') {
            $query->orderBy('is_active', 'desc')
                  ->orderBy('updated_at', $sortDirection);
        }

        $categories = $query->get()->map(function ($category) {
            return [
                'category_id' => $category->category_id,
                'category_name' => $category->category_name,
                'description' => $category->description,
                'is_active' => $category->is_active,
                'status' => $category->is_active ? 'Aktif' : 'Non-Aktif',
                'created_by' => $category->creator ? $category->creator->name : null,
                'updated_by' => $category->updater ? $category->updater->name : null,
                'created_at' => $category->created_at->toDateTimeString(),
                'updated_at' => $category->updated_at->toDateTimeString(),
            ];
        });

        Log::debug('Fetched categories for index', ['count' => $categories->count(), 'status_filter' => $status]);

        return Inertia::render('Admin/AnnouncementCategory/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'categories' => $categories,
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
            'category_name' => 'required|string|max:255|unique:announcement_categories,category_name',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $categoryId = $this->generateCategoryId();

        try {
            Log::debug('Creating announcement category', [
                'category_id' => $categoryId,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? true,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            AnnouncementCategory::create([
                'category_id' => $categoryId,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? true,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
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
            'category' => [
                'category_id' => $category->category_id,
                'category_name' => $category->category_name,
                'description' => $category->description,
                'is_active' => $category->is_active,
                'status' => $category->is_active ? 'Aktif' : 'Non-Aktif',
            ],
        ]);
    }

    public function update(Request $request, $category_id)
    {
        $request->validate([
            'category_name' => 'required|string|max:255|unique:announcement_categories,category_name,' . $category_id . ',category_id',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        try {
            $category = AnnouncementCategory::findOrFail($category_id);

            Log::debug('Updating announcement category', [
                'category_id' => $category_id,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? $category->is_active,
                'updated_by' => Auth::id(),
            ]);

            $newIsActive = $request->has('is_active') ? $request->is_active : $category->is_active;
            if ($category->is_active && !$newIsActive) {
                Announcement::where('category_id', $category_id)->update([
                    'is_active' => false,
                    'updated_by' => Auth::id(),
                ]);
                Log::info('Deactivated announcements for category', [
                    'category_id' => $category_id,
                    'updated_by' => Auth::id(),
                ]);
            }

            $category->update([
                'category_name' => $request->category_name,
                'description' => $request->description,
                'is_active' => $newIsActive,
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

            $announcements = Announcement::where('category_id', $category_id)->get();
            foreach ($announcements as $announcement) {
                if ($announcement->media) {
                    Storage::disk('public')->delete($announcement->media);
                    Log::debug('Deleted announcement media', [
                        'announcement_id' => $announcement->announcement_id,
                        'media' => $announcement->media,
                    ]);
                }
                $announcement->delete();
                Log::info('Deleted announcement', [
                    'announcement_id' => $announcement->announcement_id,
                    'category_id' => $category_id,
                ]);
            }

            $category->delete();
            Log::info('Deleted announcement category', [
                'category_id' => $category_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting announcement category: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus kategori pengumuman: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.announcement-category.index')
            ->with('success', 'Kategori dan pengumuman terkait berhasil dihapus!');
    }

    public function toggleActive(Request $request, $category_id)
    {
        if ($request->method() !== 'POST') {
            throw new MethodNotAllowedHttpException(['POST'], 'Only POST requests are allowed for this endpoint.');
        }

        Log::debug('Received toggleActive request', [
            'category_id' => $category_id,
            'user_id' => Auth::id(),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
        ]);

        try {
            $category = AnnouncementCategory::findOrFail($category_id);
            $oldStatus = $category->is_active;
            $newStatus = !$category->is_active;

            Log::debug('Toggling announcement category status', [
                'category_id' => $category_id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'updated_by' => Auth::id(),
            ]);

            if ($oldStatus && !$newStatus) {
                Announcement::where('category_id', $category_id)->update([
                    'is_active' => false,
                    'updated_by' => Auth::id(),
                ]);
                Log::info('Deactivated announcements for category', [
                    'category_id' => $category_id,
                    'updated_by' => Auth::id(),
                ]);
            }

            $category->update([
                'is_active' => $newStatus,
                'updated_by' => Auth::id(),
            ]);

            Log::debug('Category updated', [
                'category_id' => $category_id,
                'is_active' => $newStatus,
            ]);

            $message = $newStatus ? 'Kategori berhasil diaktifkan.' : 'Kategori dan pengumuman terkait berhasil dinonaktifkan.';

            return redirect()->route('admin.announcement-category.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Error toggling announcement category status: ' . $e->getMessage(), [
                'category_id' => $category_id,
                'user_id' => Auth::id(),
            ]);

            return back()->withErrors(['error' => 'Gagal mengubah status kategori: ' . $e->getMessage()]);
        }
    }

    private function generateCategoryId()
    {
        $lastCategory = AnnouncementCategory::latest('category_id')->first();

        if ($lastCategory) {
            $lastIdNumber = (int) substr($lastCategory->category_id, 2);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'ac' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }
}
