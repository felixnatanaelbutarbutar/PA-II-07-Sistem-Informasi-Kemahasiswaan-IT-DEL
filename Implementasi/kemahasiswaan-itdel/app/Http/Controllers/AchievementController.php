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

        Log::info('Achievements with Types:', $achievements->toArray());

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
        // Validate the incoming request data
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:International,National,Regional',
            'achievement_type_id' => 'required|string|exists:achievement_types,type_id',
            'medal' => 'nullable|in:Gold,Silver,Bronze', // Medal is already optional
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
        ]);

        // Get the authenticated user and their role
        $user = Auth::user();
        $role = strtolower($user->role);

        // Generate a unique achievement_id
        $achievementId = $this->generateAchievementId();

        // Create a new achievement record
        try {
            Achievement::create([
                'achievement_id' => $achievementId,
                'title' => $request->title,
                'description' => $request->description,
                'category' => $request->category,
                'achievement_type_id' => $request->achievement_type_id,
                'medal' => $request->medal, // Optional
                'event_name' => $request->event_name,
                'event_date' => $request->event_date,
                'created_by' => $request->created_by,
                'updated_by' => $request->updated_by,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating achievement: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create achievement: ' . $e->getMessage()])->withInput();
        }

        // Fetch updated data for the index view
        $achievements = Achievement::with('achievementType')->get();
        $achievementTypes = AchievementType::all();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        // Redirect to the index route with updated data
        return redirect()->route('admin.achievements.index')->with([
            'success' => 'Prestasi berhasil ditambahkan.',
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
            'medal' => 'nullable|in:Gold,Silver,Bronze', // Medal is optional
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
        ]);

        try {
            $achievement->update($request->only([
                'title',
                'description',
                'category',
                'achievement_type_id',
                'medal',
                'event_name',
                'event_date',
            ]));
        } catch (\Exception $e) {
            Log::error('Error updating achievement: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update achievement: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.achievements.index')->with('success', 'Prestasi berhasil diperbarui!');
    }

    public function destroy(Achievement $achievement)
    {
        try {
            $achievement->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting achievement: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete achievement: ' . $e->getMessage()]);
        }

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
        return 'ach' . str_pad($newIdNumber, 7, '0', STR_PAD_LEFT); // Adjusted to ensure 10 characters
    }

    public function getGroupedAchievements()
    {
        try {
            // Ambil data prestasi
            $achievements = Achievement::select('category', 'medal')
                ->get();

            // Inisialisasi groupedAchievements berdasarkan kategori dan medali
            $groupedAchievements = [
                'International' => [
                    'Gold' => 0,
                    'Silver' => 0,
                    'Bronze' => 0,
                ],
                'National' => [
                    'Gold' => 0,
                    'Silver' => 0,
                    'Bronze' => 0,
                ],
                'Regional' => [
                    'Gold' => 0,
                    'Silver' => 0,
                    'Bronze' => 0,
                ],
            ];

            // Hitung jumlah prestasi per kategori dan medali
            foreach ($achievements as $achievement) {
                $category = $achievement->category;
                $medal = $achievement->medal;

                // Hanya proses jika category valid dan medal adalah Gold, Silver, atau Bronze
                if (
                    in_array($category, ['International', 'National', 'Regional']) &&
                    in_array($medal, ['Gold', 'Silver', 'Bronze'])
                ) {
                    $groupedAchievements[$category][$medal]++;
                }
            }

            return response()->json($groupedAchievements, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching grouped achievements: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch grouped achievements'], 500);
        }
    }

    public function guestIndex()
    {
        // Ambil semua data prestasi beserta tipe prestasinya
        $achievements = Achievement::with('achievementType')->get();

        // Render halaman guest menggunakan Inertia
        return Inertia::render('Achievement', [
            'achievements' => $achievements,
        ]);
    }
}
