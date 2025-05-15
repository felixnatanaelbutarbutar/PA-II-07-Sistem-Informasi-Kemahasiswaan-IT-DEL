<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Activity;
use App\Models\Announcement;
use App\Models\AspirationCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        $totalMahasiswa = User::where('role', 'mahasiswa')->count();

        // Ambil data pengguna dari session (data dari API CIS)
        $apiUser = session('api_user', [
            'user_id' => $user->id,
            'user_name' => $user->username,
            'email' => $user->email,
            'role' => $role,
            'status' => 1,
            'jabatan' => []
        ]);

        return Inertia::render('Admin/Dashboard', [
            'auth' => [
                'user' => $user, // Kirim data dari API CIS
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'totalMahasiswa' => $totalMahasiswa,
        ]);
    }

    /**
     * Fetch the count of active activities based on end_date.
     */
    public function getActiveActivitiesCount()
    {
        $today = Carbon::today(); // Tanggal saat ini: 3 Mei 2025
        $activeCount = Activity::where(function ($query) use ($today) {
            $query->where('end_date', '>=', $today) // Kegiatan yang end_date-nya setelah atau sama dengan hari ini
                  ->orWhereNull('end_date'); // Kegiatan yang end_date-nya null dianggap masih berlangsung
        })
        ->count();

        return response()->json(['active_count' => $activeCount]);
    }

    /**
     * Fetch the count of announcements.
     */
    public function getAnnouncementsCount()
    {
        $count = Announcement::count();
        return response()->json(['count' => $count]);
    }

    /**
     * Fetch all aspiration categories with their associated aspirations for API use.
     */
    public function getAspirationCategories()
    {
        try {
            // Fetch all aspiration categories with their associated aspirations
            $categories = AspirationCategory::with('aspirations')->get();

            // Format the response to match the expected structure
            $formattedCategories = $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'aspirations' => $category->aspirations,
                ];
            });

            return response()->json($formattedCategories, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching aspiration categories: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch aspiration categories'], 500);
        }
    }
}