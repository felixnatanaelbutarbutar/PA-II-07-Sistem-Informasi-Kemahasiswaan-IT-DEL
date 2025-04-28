<?php

namespace App\Http\Controllers;

use App\Models\AspirationCategory;
use App\Models\Activity;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // Fetch total number of students (assuming User model with a 'role' of 'student')
        $totalMahasiswa = User::where('role', 'student')->count();

        // Fetch data for the dashboard view
        return Inertia::render('Admin/Dashboard', [
            'totalMahasiswa' => $totalMahasiswa,
        ]);
    }

    /**
     * Fetch the count of active activities.
     */
    public function getActiveActivitiesCount()
    {
        $activeCount = Activity::where('status', 'active')->count();
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