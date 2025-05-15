<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ActivityController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        // Ambil semua kegiatan untuk kalender
        $activities = Activity::with(['creator', 'updater'])->get();

        // Ambil kegiatan aktif (end_date >= hari ini atau end_date null)
        $today = Carbon::today(); // Tanggal saat ini: 12 Mei 2025
        $activeActivities = Activity::with(['creator', 'updater'])
            ->where(function ($query) use ($today) {
                $query->where('end_date', '>=', $today) // Kegiatan yang end_date-nya setelah atau sama dengan hari ini
                      ->orWhereNull('end_date'); // Kegiatan yang end_date-nya null dianggap masih berlangsung
            })
            ->orderBy('start_date', 'asc') // Urutkan berdasarkan tanggal mulai
            ->get();

        Log::info('Activities fetched:', ['activities' => $activities->toArray()]);
        Log::info('Active activities fetched:', ['activeActivities' => $activeActivities->toArray()]);

        return Inertia::render('Admin/ActivityCalendar/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'activities' => $activities, // Untuk kalender
            'activeActivities' => $activeActivities, // Untuk daftar kegiatan aktif
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/ActivityCalendar/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $user = Auth::user();
        $role = strtolower($user->role);

        try {
            Activity::create([
                'title' => $request->title,
                'description' => $request->description,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating activity: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create activity: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.activities.index')->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    public function edit(Activity $activity)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/ActivityCalendar/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'activity' => $activity,
        ]);
    }

    public function update(Request $request, Activity $activity)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        try {
            $activity->update([
                'title' => $request->title,
                'description' => $request->description,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'updated_by' => Auth::id(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating activity: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update activity: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.activities.index')->with('success', 'Kegiatan berhasil diperbarui!');
    }

    public function destroy(Activity $activity)
    {
        try {
            $activity->delete();
        } catch (\Exception $e) {
            Log::error('Error deleting activity: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete activity: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.activities.index')->with('success', 'Kegiatan berhasil dihapus!');
    }

    public function exportToPDF(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = Activity::with(['creator'])->orderBy('start_date', 'asc');

        if ($startDate && $endDate) {
            $query->whereBetween('start_date', [$startDate, $endDate]);
        }

        $activities = $query->get();

        $logoPath = public_path('assets/images/logo/logo-removebg.png');

        $pdf = Pdf::loadView('pdf.activities', compact('activities', 'logoPath'));
        $pdf->setPaper('A4', 'portrait');

        $fileName = 'agenda-kegiatan';
        if ($startDate && $endDate) {
            $fileName .= '-' . $startDate . '-to-' . $endDate;
        } else {
            $fileName .= '-' . now()->format('Y-m-d');
        }
        $fileName .= '.pdf';

        return $pdf->download($fileName);
    }

    public function guestIndex()
    {
        // Ambil semua data kegiatan beserta pembuatnya untuk kalender
        $activities = Activity::with('creator')->get();

        // Ambil kegiatan aktif (end_date >= hari ini atau end_date null)
        $today = Carbon::today(); // Tanggal saat ini: 12 Mei 2025
        $activeActivities = Activity::with('creator')
            ->where(function ($query) use ($today) {
                $query->where('end_date', '>=', $today) // Kegiatan yang end_date-nya setelah atau sama dengan hari ini
                      ->orWhereNull('end_date'); // Kegiatan yang end_date-nya null dianggap masih berlangsung
            })
            ->orderBy('start_date', 'asc') // Urutkan berdasarkan tanggal mulai
            ->get();

        // Render halaman guest menggunakan Inertia
        return Inertia::render('ActivityCalendar', [
            'activities' => $activities, // Untuk kalender
            'activeActivities' => $activeActivities, // Untuk daftar kegiatan aktif
        ]);
    }
    public function guestExportToPDF(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = Activity::with(['creator'])->orderBy('start_date', 'asc');

        if ($startDate && $endDate) {
            $query->whereBetween('start_date', [$startDate, $endDate]);
        }

        $activities = $query->get();

        $logoPath = public_path('assets/images/logo/logo-removebg.png');

        $pdf = Pdf::loadView('pdf.activities', compact('activities', 'logoPath'));
        $pdf->setPaper('A4', 'portrait');

        $fileName = 'agenda-kegiatan';
        if ($startDate && $endDate) {
            $fileName .= '-' . $startDate . '-to-' . $endDate;
        } else {
            $fileName .= '-' . now()->format('Y-m-d');
        }
        $fileName .= '.pdf';

        return $pdf->download($fileName);
    }
}