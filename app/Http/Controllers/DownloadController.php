<?php

namespace App\Http\Controllers;

use App\Models\Download;
use App\Models\DownloadCategory;
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

        $downloads = Download::with(['category', 'creator', 'updater'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Download/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
            'downloads' => $downloads,
        ]);
    }

    public function guestIndex()
    {
        $downloads = Download::with('category')
            ->orderBy('created_at', 'desc')
            ->get();

        $categories = DownloadCategory::select('id', 'name')->get();

        return Inertia::render('Download', [
            'downloads' => $downloads->map(function ($download) {
                return [
                    'id' => $download->id,
                    'title' => $download->title,
                    'description' => $download->description,
                    'file_path' => $download->file_path,
                    'category' => $download->category ? $download->category->name : null,
                    'category_id' => $download->category_id,
                ];
            }),
            'categories' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                ];
            }),
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $categories = DownloadCategory::select('id', 'name')->get();

        return Inertia::render('Admin/Download/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:download_categories,id',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:2048',
        ]);

        $user = Auth::user();
        $filePath = $request->file('file')->store('downloads', 'public');

        Download::create([
            'title' => $request->title,
            'description' => $request->description,
            'category_id' => $request->category_id,
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

        $categories = DownloadCategory::select('id', 'name')->get();

        return Inertia::render('Admin/Download/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
            'download' => $download,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Download $download)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:download_categories,id',
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
            'category_id' => $request->category_id,
            'file_path' => $filePath,
            'updated_by' => $user->id,
        ]);

        return redirect()->route('admin.downloads.index')->with('success', 'File unduhan berhasil diperbarui.');
    }

    public function destroy(Request $request, Download $download)
    {
        if ($download->file_path) {
            Storage::disk('public')->delete($download->file_path);
        }
        $download->delete();

        return redirect()->route('admin.downloads.index')->with('success', 'File unduhan berhasil dihapus.');
    }

    public function show(Download $download)
    {
        $download->load(['category', 'creator', 'updater']);

        return Inertia::render('DownloadDetails', [
            'download' => $download,
        ]);
    }
}