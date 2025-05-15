<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ActivityController extends Controller
{
    /**
     * Get a list of activities for the calendar
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10); // Default 10 items per page
        $activities = Activity::with('creator')
            ->orderBy('start_date', 'asc')
            ->paginate($perPage);

        return response()->json($activities);
    }

    /**
     * Get active activities
     */
    public function active(Request $request)
    {
        $today = Carbon::today(); // Tanggal saat ini: 12 Mei 2025
        $activeActivities = Activity::with('creator')
            ->where(function ($query) use ($today) {
                $query->where('end_date', '>=', $today)
                    ->orWhereNull('end_date');
            })
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json($activeActivities);
    }
    public function nearest(Request $request)
    {
        $today = Carbon::today(); // Tanggal saat ini: 12 Mei 2025
        $nearestActivities = Activity::with('creator')
            ->where(function ($query) use ($today) {
                $query->where('end_date', '>=', $today) // Kegiatan yang end_date-nya setelah atau sama dengan hari ini
                    ->orWhereNull('end_date'); // Kegiatan yang end_date-nya null dianggap masih berlangsung
            })
            ->where('start_date', '>=', $today) // Hanya kegiatan yang start_date-nya >= hari ini
            ->orderBy('start_date', 'asc') // Urutkan dari yang terdekat
            ->take(4) // Ambil 4 kegiatan saja
            ->get();

        return response()->json($nearestActivities);
    }
}
