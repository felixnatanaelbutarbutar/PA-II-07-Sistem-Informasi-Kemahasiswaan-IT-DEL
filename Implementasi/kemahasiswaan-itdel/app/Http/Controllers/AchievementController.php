<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\AchievementType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class AchievementController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $achievements = Achievement::with('achievementType')->get();

        return Inertia::render('Admin/Achievement/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'achievements' => $achievements,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        $achievementTypes = AchievementType::all();

        return Inertia::render('Admin/Achievement/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'achievementTypes' => $achievementTypes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:International,National,Regional',
            'achievement_type_id' => 'required|exists:achievement_types,type_id',
            'rank' => 'nullable|integer|min:1|max:3',
            'medal' => 'nullable|in:Gold,Silver,Bronze',
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
        ]);
    
        $user = Auth::user();
        $role = strtolower($user->role);
    
        // Generate ID otomatis untuk achievement_id
        $achievementId = $this->generateAchievementId(); 
    
        // Simpan data ke database
        Achievement::create([
            'achievement_id' => $achievementId,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'achievement_type_id' => $request->achievement_type_id,
            'rank' => $request->rank,
            'medal' => $request->medal,
            'event_name' => $request->event_name,
            'event_date' => $request->event_date,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);
    
        // Ambil ulang data untuk dikirim ke frontend
        $achievements = Achievement::with('achievementType')->get();
        $achievementTypes = AchievementType::all();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
    
        return redirect()->route('admin.achievements.index')->with([
            'success' => 'Prestasi berhasil ditambahkan!',
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'achievements' => $achievements,
            'achievementTypes' => $achievementTypes,
            'menu' => $menuItems,
        ]);
    }

    public function edit(Achievement $achievement)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        $achievementTypes = AchievementType::all();

        return Inertia::render('Admin/Achievement/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'achievement' => $achievement,
            'achievementTypes' => $achievementTypes,
        ]);
    }

    public function update(Request $request, Achievement $achievement)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:International,National,Regional',
            'achievement_type_id' => 'required|exists:achievement_types,type_id',
            'rank' => 'nullable|integer|min:1|max:3',
            'medal' => 'nullable|in:Gold,Silver,Bronze',
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
        ]);

        $achievement->update($request->all());

        return redirect()->route('admin.achievements.index')->with('success', 'Prestasi berhasil diperbarui!');
    }

    public function destroy(Achievement $achievement)
    {
        $achievement->delete();
        return redirect()->route('admin.achievements.index')->with('success', 'Prestasi berhasil dihapus!');
    }

    /**
     * Generate a unique ID for achievement_id
     */
    private function generateAchievementId()
    {
        // Ambil ID terakhir dari database
        $lastAchievement = Achievement::latest('achievement_id')->first();

        if ($lastAchievement) {
            // Ambil angka dari ID terakhir dan tambahkan 1
            $lastIdNumber = (int) substr($lastAchievement->achievement_id, 3);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            // Jika belum ada data, mulai dari 1
            $newIdNumber = 1;
        }

        // Format ID baru (contoh: ACH001, ACH002, ...)
        return 'ach' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }
}
