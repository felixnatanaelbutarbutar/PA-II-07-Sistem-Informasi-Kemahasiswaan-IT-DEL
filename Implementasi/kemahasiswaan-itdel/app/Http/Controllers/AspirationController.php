<?php

namespace App\Http\Controllers;

use App\Models\Aspiration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Helpers\RoleHelper;

class AspirationController extends Controller
{
    /**
     * Display the aspiration form page for guests and mahasiswa.
     */
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('Aspiration', [
            'auth' => [
                'user' => $user,
                'isMahasiswa' => $user && $user->role === 'mahasiswa',
            ],
        ]);
    }

    /**
     * Display a listing of aspiration requests for admin (kemahasiswaan role).
     */
    public function indexAdmin()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $aspirations = Aspiration::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $aspirations->getCollection()->transform(function ($aspiration) {
            return [
                'id' => $aspiration->id,
                'user' => [
                    'id' => $aspiration->user ? $aspiration->user->id : null,
                    'name' => $aspiration->user ? $aspiration->user->name : 'Unknown',
                ],
                'story' => $aspiration->story,
                'noTelephone' => $aspiration->noTelephone,
                'created_at' => $aspiration->created_at,
                'updated_at' => $aspiration->updated_at,
            ];
        });

        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Aspiration/index', [
            'auth' => [
                'user' => $user,
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'aspirations' => $aspirations,
        ]);
    }

    /**
     * Store a new aspiration request (for mahasiswa only).
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'mahasiswa') {
            return redirect()->route('login')->with('error', 'Anda harus login sebagai mahasiswa untuk mengirimkan cerita aspirasi.');
        }

        $validated = $request->validate([
            'story' => 'required|string|max:1000',
            'noTelephone' => 'required|string|max:15|regex:/^[0-9+()-]+$/',
        ]);

        Aspiration::create([
            'requestBy' => $user->id,
            'story' => $validated['story'],
            'noTelephone' => $validated['noTelephone'],
        ]);

        return redirect()->route('aspiration.index')->with('success', 'Cerita aspirasi berhasil dikirim.');
    }

    /**
     * Display the details of an aspiration request.
     */
    public function show($id)
    {
        $aspiration = Aspiration::with('user')->findOrFail($id);

        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Aspiration/Show', [
            'auth' => [
                'user' => $user,
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'aspiration' => [
                'id' => $aspiration->id,
                'user' => [
                    'id' => $aspiration->user ? $aspiration->user->id : null,
                    'name' => $aspiration->user ? $aspiration->user->name : 'Unknown',
                ],
                'story' => $aspiration->story,
                'noTelephone' => $aspiration->noTelephone,
                'created_at' => $aspiration->created_at,
                'updated_at' => $aspiration->updated_at,
            ],
        ]);
    }

    /**
     * Delete an aspiration request (admin only).
     */
    public function destroy($id)
    {
        $aspiration = Aspiration::findOrFail($id);
        $aspiration->delete();

        return redirect()->route('admin.aspiration.index')->with('success', 'Cerita aspirasi berhasil dihapus.');
    }
}
