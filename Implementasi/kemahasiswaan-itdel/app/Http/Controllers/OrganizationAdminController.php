<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Helpers\RoleHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class OrganizationAdminController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            Log::error('User not authenticated in OrganizationAdminController::index');
            return redirect()->route('login')->with('error', 'Silakan login kembali.');
        }

        $role = strtolower($user->role);
        try {
            $menuItems = RoleHelper::getNavigationMenu($role);
            $permissions = RoleHelper::getRolePermissions($role);
        } catch (\Exception $e) {
            Log::error('Error fetching navigation or permissions:', ['error' => $e->getMessage()]);
            return redirect()->route('login')->with('error', 'Terjadi kesalahan. Silakan coba lagi.');
        }

        // Fetch existing admins from the users table (for role lookup on the frontend)
        $admins = User::whereIn('role', ['adminbem', 'adminmpm'])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'username', 'email', 'nim', 'role', 'status'])
            ->keyBy('nim'); // Key by NIM for easy lookup

        Log::info('Admins data in index:', ['admins' => $admins->toArray()]);

        return Inertia::render('Admin/OrganizationAdmin/index', [
            'permissions' => $permissions,
            'navigation' => $menuItems,
            'existingAdmins' => $admins,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        if (!$user) {
            Log::error('User not authenticated in OrganizationAdminController::create');
            return redirect()->route('login')->with('error', 'Silakan login kembali.');
        }

        $role = strtolower($user->role);
        try {
            $menuItems = RoleHelper::getNavigationMenu($role);
            $permissions = RoleHelper::getRolePermissions($role);
        } catch (\Exception $e) {
            Log::error('Error fetching navigation or permissions:', ['error' => $e->getMessage()]);
            return redirect()->route('login')->with('error', 'Terjadi kesalahan. Silakan coba lagi.');
        }

        return Inertia::render('Admin/OrganizationAdmin/add', [
            'permissions' => $permissions,
            'navigation' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:adminbem,adminmpm',
        ]);

        try {
            User::create([
                'username' => $request->username,
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => 'active',
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating admin:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('notification', ['type' => 'error', 'message' => 'Gagal menambahkan admin: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.organization-admins.index')
            ->with('notification', ['type' => 'success', 'message' => 'Admin organisasi berhasil ditambahkan.']);
    }

    public function toggleStatus(User $user)
    {
        if (!in_array($user->role, ['adminbem', 'adminmpm'])) {
            return redirect()->route('admin.organization-admins.index')
                ->with('notification', ['type' => 'error', 'message' => 'User tidak valid untuk diubah statusnya.']);
        }

        try {
            $user->update([
                'status' => $user->status === 'active' ? 'inactive' : 'active',
            ]);
        } catch (\Exception $e) {
            Log::error('Error toggling status:', ['error' => $e->getMessage()]);
            return redirect()->route('admin.organization-admins.index')
                ->with('notification', ['type' => 'error', 'message' => 'Gagal mengubah status: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.organization-admins.index')
            ->with('notification', ['type' => 'success', 'message' => 'Status admin organisasi berhasil diubah.']);
    }

    public function setRole(Request $request)
    {
        $request->validate([
            'nim' => 'required|string',
            'username' => 'required|string',
            'email' => 'required|email',
            'name' => 'required|string',
            'prodi' => 'nullable|string',
            'role' => 'required|in:adminbem,adminmpm,mahasiswa',
        ]);

        Log::info('Setting role for user:', [
            'nim' => $request->nim,
            'email' => $request->email,
            'role' => $request->role,
        ]);

        // Check if the user already exists in the users table (by NIM or email)
        $user = User::where('nim', $request->nim)
            ->orWhere('email', $request->email)
            ->first();

        if ($request->role === 'mahasiswa') {
            if ($user) {
                try {
                    $user->delete();
                } catch (\Exception $e) {
                    Log::error('Error deleting user:', ['error' => $e->getMessage()]);
                    return redirect()->back()->with('notification', ['type' => 'error', 'message' => 'Gagal menghapus user: ' . $e->getMessage()]);
                }
                return redirect()->back()->with('notification', ['type' => 'success', 'message' => 'User berhasil dihapus dari daftar admin organisasi.']);
            }
            return redirect()->back()->with('notification', ['type' => 'success', 'message' => 'Tidak ada perubahan, user belum terdaftar sebagai admin.']);
        }

        try {
            if ($user) {
                $user->update([
                    'role' => $request->role,
                    'status' => 'active',
                ]);
            } else {
                $user = User::create([
                    'username' => $request->username,
                    'email' => $request->email,
                    'name' => $request->name,
                    'nim' => $request->nim,
                    'prodi' => $request->prodi,
                    'role' => $request->role,
                    'status' => 'active',
                    // Password tidak diset karena autentikasi menggunakan CIS API
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error setting role:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('notification', ['type' => 'error', 'message' => 'Gagal memperbarui role: ' . $e->getMessage()]);
        }

        return redirect()->back()->with('notification', ['type' => 'success', 'message' => 'Role berhasil diperbarui untuk ' . $user->name]);
    }
}