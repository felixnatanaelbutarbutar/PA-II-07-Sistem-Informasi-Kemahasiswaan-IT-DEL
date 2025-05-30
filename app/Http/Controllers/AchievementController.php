<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Models\AchievementType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
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
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:International,National,Regional',
            'achievement_type_id' => 'required|string|exists:achievement_types,type_id',
            'medal' => 'nullable|in:Gold,Silver,Bronze',
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'is_active' => 'required|boolean', // Validasi untuk is_active
        ]);

        try {
            $achievementId = $this->generateAchievementId();

            $data = [
                'achievement_id' => $achievementId,
                'title' => $request->title,
                'description' => $request->description,
                'category' => $request->category,
                'achievement_type_id' => $request->achievement_type_id,
                'medal' => $request->medal,
                'event_name' => $request->event_name,
                'event_date' => $request->event_date,
                'created_by' => $request->created_by,
                'updated_by' => $request->updated_by,
                'is_active' => $request->is_active, // Set is_active dari request
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('achievements', 'public');
                $data['image'] = $imagePath;
            }

            Achievement::create($data);

            return redirect()->route('admin.achievements.index')->with('success', 'Prestasi berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Error creating achievement: ' . $e->getMessage());
            return redirect()->route('admin.achievements.index')->with('error', 'Gagal menambahkan prestasi: ' . $e->getMessage());
        }
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
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function update(Request $request, Achievement $achievement)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:International,National,Regional',
            'achievement_type_id' => 'required|exists:achievement_types,type_id',
            'medal' => 'nullable|in:Gold,Silver,Bronze',
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'is_active' => 'required|boolean', // Validasi untuk is_active
        ]);

        try {
            $data = $request->only([
                'title',
                'description',
                'category',
                'achievement_type_id',
                'medal',
                'event_name',
                'event_date',
                'is_active', // Sertakan is_active
            ]);

            // Handle image upload
            if ($request->hasFile('image')) {
                // Hapus gambar lama jika ada
                if ($achievement->image) {
                    Storage::disk('public')->delete($achievement->image);
                }
                $imagePath = $request->file('image')->store('achievements', 'public');
                $data['image'] = $imagePath;
            }

            $data['updated_by'] = Auth::id();

            $achievement->update($data);

            return redirect()->route('admin.achievements.index')->with('success', 'Prestasi berhasil diperbarui!');
        } catch (\Exception $e) {
            Log::error('Error updating achievement: ' . $e->getMessage());
            return redirect()->route('admin.achievements.index')->with('error', 'Gagal memperbarui prestasi: ' . $e->getMessage());
        }
    }

    public function destroy(Request $request, $achievement_id)
    {
        try {
            $achievement = Achievement::where('achievement_id', $achievement_id)->firstOrFail();

            // Hapus gambar dari storage jika ada
            if ($achievement->image) {
                Storage::disk('public')->delete($achievement->image);
            }

            $achievement->delete();

            return redirect()->route('admin.achievements.index')->with('success', 'Prestasi berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Error deleting achievement: ' . $e->getMessage());
            return redirect()->route('admin.achievements.index')->with('error', 'Gagal menghapus prestasi: ' . $e->getMessage());
        }
    }

    public function toggleActive(Request $request, $achievement_id)
    {
        try {
            $achievement = Achievement::where('achievement_id', $achievement_id)->firstOrFail();

            // Toggle status is_active
            $achievement->is_active = !$achievement->is_active;
            $achievement->updated_by = Auth::id();
            $achievement->save();

            $message = $achievement->is_active ? 'Prestasi berhasil diaktifkan!' : 'Prestasi berhasil dinonaktifkan!';

            return redirect()->route('admin.achievements.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Error toggling achievement active status: ' . $e->getMessage());
            return redirect()->route('admin.achievements.index')->with('error', 'Gagal mengubah status prestasi: ' . $e->getMessage());
        }
    }

    private function generateAchievementId()
    {
        $lastAchievement = Achievement::latest('achievement_id')->first();

        if ($lastAchievement) {
            $lastIdNumber = (int) substr($lastAchievement->achievement_id, 3);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'ach' . str_pad($newIdNumber, 7, '0', STR_PAD_LEFT);
    }

    public function getGroupedAchievements()
    {
        try {
            $achievements = Achievement::select('category', 'medal')->where('is_active', true)->get(); // Hanya ambil yang aktif

            $groupedAchievements = [
                'International' => ['Gold' => 0, 'Silver' => 0, 'Bronze' => 0],
                'National' => ['Gold' => 0, 'Silver' => 0, 'Bronze' => 0],
                'Regional' => ['Gold' => 0, 'Silver' => 0, 'Bronze' => 0],
            ];

            foreach ($achievements as $achievement) {
                $category = $achievement->category;
                $medal = $achievement->medal;

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
        $achievements = Achievement::with('achievementType')
        ->where('is_active', true)->get(); // Hanya tampilkan yang aktif

        return Inertia::render('Achievement', [
            'achievements' => $achievements,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function show($achievement_id)
    {
        $achievement = Achievement::with('achievementType')
            ->where('achievement_id', $achievement_id)
            ->where('is_active', true) // Pastikan hanya menampilkan yang aktif
            ->firstOrFail();

        return Inertia::render('AchievementDetail', [
            'achievement' => $achievement,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }
}