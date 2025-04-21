<?php

namespace App\Http\Controllers;

use App\Models\AchievementType;
use App\Helpers\RoleHelper;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AchievementTypeController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $achievementTypes = AchievementType::all();

        return Inertia::render('Admin/AchievementType/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'achievementTypes' => $achievementTypes,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/AchievementType/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $achievementType = new AchievementType();
        $achievementType->type_id = 'type' . sprintf('%03d', AchievementType::count() + 1); // Generate type_id seperti type001, type002, dll.
        $achievementType->type_name = $request->type_name;
        $achievementType->description = $request->description;
        $achievementType->created_by = Auth::id();
        $achievementType->updated_by = Auth::id();
        $achievementType->save();

        return redirect()->route('admin.achievement-type.index')->with('success', 'Jenis Prestasi berhasil ditambahkan.');
    }

    public function edit(AchievementType $achievementType)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/AchievementType/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'achievementType' => $achievementType,
        ]);
    }

    public function update(Request $request, AchievementType $achievementType)
    {
        $request->validate([
            'type_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $achievementType->type_name = $request->type_name;
        $achievementType->description = $request->description;
        $achievementType->updated_by = Auth::id();
        $achievementType->save();

        return redirect()->route('admin.achievement-type.index')->with('success', 'Jenis Prestasi berhasil diperbarui.');
    }

    public function destroy(AchievementType $achievementType)
    {
        $achievementType->delete();

        return redirect()->route('admin.achievement-type.index')->with('success', 'Jenis Prestasi berhasil dihapus.');
    }
}