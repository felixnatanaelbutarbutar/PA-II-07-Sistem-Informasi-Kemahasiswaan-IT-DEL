<?php

namespace App\Http\Controllers;

use App\Models\Download;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Helpers\RoleHelper;

class DownloadController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $downloads = Download::with(['creator', 'updater'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Unduhan/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
            'downloads' => $downloads,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Unduhan/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:2048',
        ]);

        $user = Auth::user();
        $filePath = $request->file('file')->store('downloads', 'public');

        Download::create([
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $filePath,
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        return redirect()->route('admin.downloads.index')->with('success', 'File unduhan berhasil ditambahkan.');
    }

    public function edit(Download $download)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Unduhan/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
            'download' => $download,
        ]);
    }

    public function update(Request $request, Download $download)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx|max:2048',
        ]);

        $user = Auth::user();
        $filePath = $download->file_path;

        if ($request->hasFile('file')) {
            if ($download->file_path) {
                Storage::disk('public')->delete($download->file_path);
            }
            $filePath = $request->file('file')->store('downloads', 'public');
        }

        $download->update([
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $filePath,
            'updated_by' => $user->id,
        ]);

        return redirect()->route('admin.downloads.index')->with('success', 'File unduhan berhasil diperbarui.');
    }

    public function destroy(Download $download)
    {
        if ($download->file_path) {
            Storage::disk('public')->delete($download->file_path);
        }
        $download->delete();

        return redirect()->route('admin.downloads.index')->with('success', 'File unduhan berhasil dihapus.');
    }

    public function show(Download $download)
    {
        // Memuat relasi creator dan updater untuk menampilkan informasi pembuat dan pengubah
        $download->load(['creator', 'updater']);

        return Inertia::render('Download', [
            'download' => $download,
        ]);
    }
}