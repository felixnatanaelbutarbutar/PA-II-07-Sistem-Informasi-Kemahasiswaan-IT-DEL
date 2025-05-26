<?php

namespace App\Http\Controllers;

use App\Models\Meta;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MetaController extends Controller
{
    public function index()
    {
        $metas = Meta::with('creator')->get();
        $user = Auth::user();
        $role = strtolower($user->role ?? 'default');
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        Log::info("Role: {$role}, Menu: ", $menuItems);

        return inertia('Admin/Meta/index', [
            'metas' => $metas,
            'userRole' => $role,
            'auth' => ['user' => $user],
            'permissions' => $permissions,
            'menu' => $menuItems,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role ?? 'default');
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return inertia('Admin/Meta/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'meta_key' => 'required|string|max:255|unique:meta,meta_key',
            'meta_title' => 'required|string|max:255',
            'meta_description' => 'required|string',
            'file' => 'nullable|file|mimes:png,jpg,jpeg,pdf|max:2048',
            'is_active' => 'required|boolean',
            'created_by' => 'required|exists:users,id',
        ]);

        // Generate ID otomatis
        $metaId = $this->generateMetaId();
        $validated['id'] = $metaId;

        // Handle file upload
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('meta_files', 'public');
            $validated['file_path'] = $path;
        }

        Meta::create($validated);

        return redirect()->route('admin.meta.index')->with('success', 'Meta berhasil ditambahkan!');
    }

    public function edit($meta_id)
    {
        $meta = Meta::with('creator')->findOrFail($meta_id);
        $user = Auth::user();
        $role = strtolower($user->role ?? 'default');
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return inertia('Admin/Meta/edit', [
            'meta' => $meta,
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
        ]);
    }

    public function update(Request $request, $meta_id)
    {
        Log::debug('Request data:', $request->all());
        $meta = Meta::findOrFail($meta_id);
        $validated = $request->validate([
            'meta_key' => 'required|string|max:255|unique:meta,meta_key,' . $meta_id,
            'meta_title' => 'required|string|max:255',
            'meta_description' => 'required|string',
            'file' => 'nullable|file|mimes:png,jpg,jpeg,pdf|max:2048',
            'is_active' => 'required|boolean',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
        ]);

        // Handle file upload
        if ($request->hasFile('file')) {
            // Hapus file lama jika ada
            if ($meta->file_path) {
                Storage::disk('public')->delete($meta->file_path);
            }
            $path = $request->file('file')->store('meta_files', 'public');
            $validated['file_path'] = $path;
        }

        $meta->update($validated);

        return redirect()->route('admin.meta.index')->with('success', 'Meta berhasil diperbarui!');
    }

    public function destroy($meta_id)
    {
        $meta = Meta::findOrFail($meta_id);

        // Hapus file dari storage jika ada
        if ($meta->file_path) {
            Storage::disk('public')->delete($meta->file_path);
        }

        $meta->delete();

        return redirect()->route('admin.meta.index')->with('success', 'Meta berhasil dihapus!');
    }

    public function toggleActive(Request $request, $meta_id)
    {
        $meta = Meta::findOrFail($meta_id);
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $meta->update(['is_active' => $validated['is_active']]);

        return redirect()->route('admin.meta.index')->with('success', 'Status meta berhasil diperbarui!');
    }

    /**
     * Generate a unique ID for meta_id
     */
    private function generateMetaId()
    {
        $lastMeta = Meta::latest('id')->first();

        if ($lastMeta) {
            $lastIdNumber = (int) substr($lastMeta->id, 4);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'meta' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }
}