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
        $role = strtolower($user->user_role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        Log::info("Role: {$role}, Menu: ", $menuItems);

        return inertia('Admin/Meta/index', [
            'metas' => $metas,
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->user_role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return inertia('Admin/Meta/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|max:10|unique:meta,id',
            'meta_key' => 'required|string|max:255|unique:meta,meta_key',
            'meta_title' => 'required|string|max:255',
            'meta_description' => 'required|string',
            'is_active' => 'required|boolean',
            'created_by' => 'required|exists:users,id',
        ]);

        Meta::create($validated);

        return redirect()->route('admin.meta.index')->with('success', 'Meta berhasil ditambahkan!');
    }

    public function edit($meta_id)
    {
        $meta = Meta::with('creator')->findOrFail($meta_id);
        return inertia('Admin/Meta/edit', [
            'meta' => $meta,
        ]);
    }

    public function update(Request $request, $meta_id)
    {
        $meta = Meta::findOrFail($meta_id);
        $validated = $request->validate([
            'id' => 'required|string|max:10|unique:meta,id,' . $meta_id,
            'meta_key' => 'required|string|max:255|unique:meta,meta_key,' . $meta_id,
            'meta_title' => 'required|string|max:255',
            'meta_description' => 'required|string',
            'is_active' => 'required|boolean',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
        ]);

        $meta->update($validated);

        return redirect()->route('admin.meta.index')->with('success', 'Meta berhasil diperbarui!');
    }

    public function destroy($meta_id)
    {
        $meta = Meta::findOrFail($meta_id);
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

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        $path = $request->file('image')->store('public/images');
        $url = Storage::url($path);

        return response()->json(['url' => $url]);
    }
}
