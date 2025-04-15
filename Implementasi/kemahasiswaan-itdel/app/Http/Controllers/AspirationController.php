<?php

namespace App\Http\Controllers;

use App\Models\Aspiration;
use App\Models\AspirationCategory;
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

        return Inertia::render('Aspiration', [
            'categories' => $categories,
        ]);
    }

    public function indexAdmin()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $categories = AspirationCategory::all();

        $aspirations = Aspiration::with(['user', 'category'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

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
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'story' => 'required|string|max:1000',
            'category_id' => 'required|exists:aspiration_categories,id',
            'image' => 'nullable|image|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('aspirations', 'public');
        }

        Aspiration::create([
            'requestBy' => null, // Set null karena pengguna tidak perlu login
            'story' => $validated['story'],
            'category_id' => $validated['category_id'],
            'image' => $imagePath,
        ]);

        return redirect()->route('aspiration.index')->with('success', 'Aspirasi berhasil dikirim.');
    }

    public function show($id)
    {
        $aspiration = Aspiration::with(['user', 'category'])->findOrFail($id);

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
}
