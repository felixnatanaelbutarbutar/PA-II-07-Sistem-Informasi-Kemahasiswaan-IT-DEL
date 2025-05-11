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
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        // Get query parameters for filtering and searching
        $status = $request->query('status'); // 'active', 'inactive', or null
        $sortBy = $request->query('sort_by', 'updated_at'); // Default to updated_at
        $sortDirection = $request->query('sort_direction', 'desc'); // Default to desc
        $search = $request->query('search');

        $query = ScholarshipCategory::with(['creator', 'updater']);

        // Apply status filter
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        // Apply case-insensitive search on category_name and description
        if ($search) {
            // Split search term into individual words
            $searchTerms = array_filter(explode(' ', trim($search)));

            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $lowerTerm = strtolower($term);
                    $q->orWhereRaw('LOWER(category_name) LIKE ?', ['%' . $lowerTerm . '%'])
                      ->orWhereRaw('LOWER(description) LIKE ?', ['%' . $lowerTerm . '%']);
                }
            });
        }

        // Apply sorting (status first, then updated_at)
        if ($sortBy === 'updated_at') {
            $query->orderBy('is_active', 'desc') // Prioritize active status
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

        return Inertia::render('Admin/ScholarshipCategory/index', [
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
            'is_active' => 'sometimes|boolean',
        ]);

        $categoryId = $this->generateCategoryId();

        try {
            Log::debug('Creating scholarship category', [
                'category_id' => $categoryId,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? true,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            ScholarshipCategory::create([
                'category_id' => $categoryId,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? true,
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
            'category_name' => 'required|string|max:255|unique:scholarship_categories,category_name,' . $category_id . ',category_id',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        try {
            $category = ScholarshipCategory::findOrFail($category_id);

            Log::debug('Updating scholarship category', [
                'category_id' => $category_id,
                'category_name' => $request->category_name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? $category->is_active,
                'updated_by' => Auth::id(),
            ]);

            $category->update([
                'category_name' => $request->category_name,
                'description' => $request->description,
                'is_active' => $request->has('is_active') ? $request->is_active : $category->is_active,
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

    public function toggleActive(Request $request, $category_id)
    {
        try {
            $category = ScholarshipCategory::findOrFail($category_id);
            $oldStatus = $category->is_active;
            $newStatus = !$category->is_active;

            \Log::debug('Toggling scholarship category status', [
                'category_id' => $category_id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'updated_by' => Auth::id(),
            ]);

            $category->update([
                'is_active' => $newStatus,
                'updated_by' => Auth::id(),
            ]);

            \Log::debug('Category updated', [
                'category_id' => $category_id,
                'is_active' => $category->fresh()->is_active,
            ]);

            $message = $newStatus ? 'Kategori berhasil diaktifkan.' : 'Kategori berhasil dinonaktifkan.';

            if ($request->header('X-Inertia')) {
                $user = Auth::user();
                $role = strtolower($user->role);
                $menuItems = RoleHelper::getNavigationMenu($role);
                $permissions = RoleHelper::getRolePermissions($role);

                $categories = ScholarshipCategory::with(['creator', 'updater'])->get()->map(function ($category) {
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

                return Inertia::render('Admin/ScholarshipCategory/index', [
                    'auth' => ['user' => $user],
                    'userRole' => $role,
                    'permissions' => $permissions,
                    'menu' => $menuItems,
                    'categories' => $categories,
                    'flash' => ['success' => $message],
                ]);
            }

            return redirect()->route('admin.scholarship-category.index')->with('success', $message);
        } catch (\Exception $e) {
            \Log::error('Error toggling scholarship category status: ' . $e->getMessage(), [
                'category_id' => $category_id,
                'user_id' => Auth::id(),
            ]);
            if ($request->header('X-Inertia')) {
                return Inertia::render('Admin/ScholarshipCategory/index', [
                    'flash' => ['error' => 'Failed to toggle category status: ' . $e->getMessage()],
                ])->withStatus(422);
            }
            return back()->withErrors(['error' => 'Failed to toggle category status: ' . $e->getMessage()]);
        }
    }

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
