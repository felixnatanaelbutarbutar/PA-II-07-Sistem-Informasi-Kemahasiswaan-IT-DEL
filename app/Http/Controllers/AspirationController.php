<?php

namespace App\Http\Controllers;

use App\Models\Aspiration;
use App\Models\AspirationCategory;
use App\Models\Mpm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Helpers\RoleHelper;

class AspirationController extends Controller
{
    public function index()
    {
        $categories = AspirationCategory::all();
        $mpm = MPM::first(); // Ambil data MPM pertama (asumsikan hanya ada satu)

        return Inertia::render('Aspiration', [
            'categories' => $categories,
            'mpm' => $mpm,
        ]);
    }

    public function indexAdmin()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $categories = AspirationCategory::all();

        $aspirations = Aspiration::with(['category'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $mpm = MPM::first(); // Ambil data MPM pertama (asumsikan hanya ada satu)

        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Aspiration/index', [
            'auth' => [
                'user' => $user
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'categories' => $categories,
            'aspirations' => $aspirations,
            'mpm' => $mpm,
        ]);
    }

    public function store(Request $request)
    {
        // Ambil data MPM terbaru
        $mpm = MPM::first();

        if (!$mpm || $mpm->aspiration_status === 'CLOSED') {
            return redirect()->route('mpm.show')->with('error', 'Pendataan aspirasi sedang ditutup.');
        }

        $validated = $request->validate([
            'story' => 'required|string|max:1000',
            'category_id' => 'required|exists:aspiration_categories,id',
            'image' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('aspirations', 'public');
        }

        Aspiration::create([
            'mpm_id' => $mpm->id,
            'story' => $validated['story'],
            'category_id' => $validated['category_id'],
            'image' => $imagePath,
        ]);

        return redirect()->route('aspiration.index')->with('success', 'Aspirasi berhasil dikirim!');
    }

    public function show($id)
    {
        $aspiration = Aspiration::with(['category'])->findOrFail($id);

        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Aspiration/show', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'aspiration' => $aspiration,
        ]);
    }

    public function destroy($id)
    {
        $aspiration = Aspiration::findOrFail($id);
        if ($aspiration->image) {
            Storage::disk('public')->delete($aspiration->image);
        }
        $aspiration->delete();

        return redirect()->route('admin.aspiration.index')->with('success', 'Aspirasi berhasil dihapus.');
    }

    public function updateAspirationStatus(Request $request)
    {
        $mpm = MPM::first();
        if (!$mpm) {
            return redirect()->route('admin.aspiration.index')->with('error', 'Data MPM tidak ditemukan.');
        }

        $status = $request->input('status');
        if (!in_array($status, ['OPEN', 'CLOSED'])) {
            return redirect()->route('admin.aspiration.index')->with('error', 'Status tidak valid.');
        }

        $mpm->aspiration_status = $status;
        $mpm->updated_by = Auth::id();
        $mpm->save();

        $message = $status === 'OPEN' ? 'Pendataan aspirasi berhasil diaktifkan.' : 'Pendataan aspirasi berhasil ditutup.';
        return redirect()->route('admin.aspiration.index')->with('success', $message);
    }
}