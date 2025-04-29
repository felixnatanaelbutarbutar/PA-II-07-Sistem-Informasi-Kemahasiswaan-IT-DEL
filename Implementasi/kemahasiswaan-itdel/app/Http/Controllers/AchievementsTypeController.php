<?php

namespace App\Http\Controllers;

use App\Models\AchievementType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class AchievementsTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $types = AchievementType::with(['creator', 'updater'])->get();

        return Inertia::render('Admin/AchievementType/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'types' => $types,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'type_name' => 'required|string|max:100|unique:achievement_types,type_name',
            'description' => 'nullable|string',
        ]);

        $user = Auth::user();
        $typeId = $this->generateTypeId();

        try {
            Log::debug('Creating achievement type', [
                'type_id' => $typeId,
                'type_name' => $request->type_name,
                'description' => $request->description,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            AchievementType::create([
                'type_id' => $typeId,
                'type_name' => $request->type_name,
                'description' => $request->description,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating achievement type: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menambahkan tipe prestasi: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.achievement-type.index')
            ->with('success', 'Tipe prestasi berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($type_id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $type = AchievementType::findOrFail($type_id);

        return Inertia::render('Admin/AchievementType/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'type' => $type,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $type_id)
    {
        $request->validate([
            'type_name' => 'required|string|max:100|unique:achievement_types,type_name,' . $type_id . ',type_id',
            'description' => 'nullable|string',
        ]);

        try {
            $type = AchievementType::findOrFail($type_id);

            Log::debug('Updating achievement type', [
                'type_id' => $type_id,
                'type_name' => $request->type_name,
                'description' => $request->description,
                'updated_by' => Auth::id(),
            ]);

            $type->update([
                'type_name' => $request->type_name,
                'description' => $request->description,
                'updated_by' => Auth::id(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating achievement type: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui tipe prestasi: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.achievement-type.index')
            ->with('success', 'Tipe prestasi berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($type_id)
    {
        try {
            $type = AchievementType::findOrFail($type_id);
            $type->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting achievement type: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus tipe prestasi: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.achievement-type.index')
            ->with('success', 'Tipe prestasi berhasil dihapus!');
    }

    /**
     * Generate a unique type_id (e.g., at001).
     */
    private function generateTypeId()
    {
        $lastType = AchievementType::latest('type_id')->first();

        if ($lastType) {
            $lastIdNumber = (int) substr($lastType->type_id, 2);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'at' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT); // at = achievement type
    }
}
