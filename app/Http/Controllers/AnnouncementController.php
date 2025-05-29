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
    public function guestIndex()
    {
        $announcements = Announcement::with(['category', 'createdBy', 'updatedBy'])->get();
        Log::info('Data pengumuman yang diambil untuk guest:', ['jumlah' => $announcements->count()]);
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

        $announcements = Announcement::with(['category', 'createdBy', 'updatedBy'])->get();

        Log::info('Announcements fetched:', ['announcements' => $announcements->toArray()]);

        return Inertia::render('Admin/Announcement/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'announcement' => $announcements,
        ]);
    }

    public function show($announcement_id)
    {
        try {
            $announcement = Announcement::with(['category', 'createdBy', 'updatedBy'])
                ->where('announcement_id', $announcement_id)
                ->where('is_active', true)
                ->firstOrFail();

            Log::info('Announcement detail fetched:', ['announcement_id' => $announcement_id]);

            return Inertia::render('AnnouncementDetail', [
                'announcement' => $announcement,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Announcement not found:', ['announcement_id' => $announcement_id]);
            return Inertia::render('AnnouncementDetail', [
                'announcement' => null, // Mengirim null untuk menampilkan "Tidak Ditemukan"
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching announcement detail: ' . $e->getMessage());
            return Inertia::render('AnnouncementDetail', [
                'announcement' => null,
            ]);
        }
    }

    private function generateAnnouncementId()
    {
        $lastAnnouncement = Announcement::orderBy('announcement_id', 'desc')->first();

        if ($lastAnnouncement) {
            $lastIdNumber = (int)substr($lastAnnouncement->announcement_id, 3);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'anc' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        $categories = AnnouncementCategory::select('category_id', 'category_name')->get();

        return Inertia::render('Admin/Announcement/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'categories' => $categories,
        ]);
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

        try {
            $announcementId = $this->generateAnnouncementId();
            $filePath = $request->file('file') ? $request->file('file')->store('announcement_file', 'public') : null;

            Announcement::create([
                'announcement_id' => $announcementId,
                'title' => $request->title,
                'content' => $request->content,
                'category_id' => $request->category_id,
                'file' => $filePath,
                'created_by' => $user->id,
                'updated_by' => $user->id,
                'is_active' => true, // Pastikan default is_active adalah true
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating announcement: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create announcement: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.announcement.index')->with('success', 'Pengumuman berhasil ditambahkan.');
    }

    public function edit(Announcement $announcement)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);
        $categories = AnnouncementCategory::select('category_id', 'category_name')->get();

        return Inertia::render('Admin/Announcement/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'announcement' => $announcement->load(['category', 'createdBy', 'updatedBy']),
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:announcement_categories,category_id',
            'file' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:2048',
        ]);

        try {
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

            Log::info('Announcement updated:', ['announcement_id' => $announcement->announcement_id]);
        } catch (\Exception $e) {
            Log::error('Error updating announcement: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update announcement: ' . $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.announcement.index')->with('success', 'Pengumuman berhasil diperbarui.');
    }

    public function destroy(Announcement $announcement)
    {
        try {
            if ($announcement->file) {
                Storage::disk('public')->delete($announcement->file);
            }
            $announcement->delete();

            Log::info('Announcement deleted:', ['announcement_id' => $announcement->announcement_id]);
        } catch (\Exception $e) {
            Log::error('Error deleting announcement: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete announcement: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.announcement.index')->with('success', 'Pengumuman berhasil dihapus.');
    }
}