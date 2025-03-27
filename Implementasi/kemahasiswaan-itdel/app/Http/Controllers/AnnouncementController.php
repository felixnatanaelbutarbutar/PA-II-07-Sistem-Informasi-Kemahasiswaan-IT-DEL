<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\AnnouncementCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class AnnouncementController extends Controller
{
    // public function guestIndex()
    // {
    //     $newsItems = News::with('category')->orderBy('created_at', 'desc')->get();
    //     $categories = NewsCategory::all();

    //     return Inertia::render('News', [
    //         'newsItems' => $newsItems,
    //         'categories' => $categories,
    //     ]);
    // }
    public function guestIndex()
    {
        $announcements = Announcement::with('category')->get();
        Log::info('Data pengumuman yang diambil:', ['jumlah' => $announcements->count()]);
        return Inertia::render('Announcement', [
            'announcement' => $announcements,
        ]);
    }

    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $announcements = Announcement::with('category')->get();

        return Inertia::render('Admin/Announcement/index', [
            'auth' => [
                'user' => $user
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'announcement' => $announcements,
        ]);
    }

    private function generateAnnouncementId()
    {
        // Ambil ID terakhir dari database berdasarkan urutan terbesar
        $lastAnnouncement = Announcement::orderBy('announcement_id', 'desc')->first();

        if ($lastAnnouncement) {
            // Ambil angka dari ID terakhir dan tambahkan 1
            $lastIdNumber = (int) substr($lastAnnouncement->announcement_id, 3);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            // Jika belum ada data, mulai dari 1
            $newIdNumber = 1;
        }

        // Format ID baru (contoh: ANC001, ANC002, ...)
        return 'ANC' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }


    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:announcement_categories,category_id',
            'file' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:2048',
        ]);

        $user = Auth::user();
        $role = strtolower($user->role);

        $announcementId = $this->generateAnnouncementId();
        $filePath = $request->file('file') ? $request->file('file')->store('announcement_file', 'public') : null;

        Announcement::create([
            'announcement_id' => $announcementId,
            'title' => $request->title,
            'content' => $request->content,
            'category_id' => $request->category_id,
            'file' => $filePath,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        // Ambil ulang data
        $announcements = Announcement::with('category')->get();
        $categories = AnnouncementCategory::all();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return redirect()->route('admin.announcement.index')->with([
            'success' => 'Pengumuman berhasil ditambahkan.',
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'announcement' => $announcements,
            'categories' => $categories,
            'menu' => $menuItems,
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        Log::info('Update request received', ['announcement_id' => $announcement->announcement_id, 'data' => $request->all()]);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:announcement_categories,category_id',
            'file' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:2048',
        ]);

        $filePath = $announcement->file;

        if ($request->hasFile('file')) {
            if ($announcement->file) {
                Storage::disk('public')->delete($announcement->file);
            }
            $file = $request->file('file');
            $fileName = Str::slug($request->title) . '-' . time() . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('announcement_file', $fileName, 'public');
        }

        $announcement->update([
            'title' => $request->title,
            'content' => $request->content,
            'category_id' => $request->category_id,
            'file' => $filePath,
            'updated_by' => Auth::id(),
        ]);

        Log::info('Announcement updated', ['announcement_id' => $announcement->announcement_id]);

        return redirect()->route('admin.announcement.index')->with('success', 'Pengumuman berhasil diperbarui.');
    }

    public function destroy(Announcement $announcement)
    {
        if ($announcement->file) {
            Storage::disk('public')->delete($announcement->file);
        }
        $announcement->delete();

        return redirect()->back()->with('success', 'Pengumuman berhasil dihapus.');
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $categories = AnnouncementCategory::select('category_id', 'category_name')->get();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Announcement/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'categories' => $categories,
            'menu' => $menuItems,
        ]);
    }

    public function edit(Announcement $announcement)
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $categories = AnnouncementCategory::all();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Announcement/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'announcement' => $announcement->load('category'),
            'categories' => $categories,
            'menu' => $menuItems,
        ]);
    }
}
