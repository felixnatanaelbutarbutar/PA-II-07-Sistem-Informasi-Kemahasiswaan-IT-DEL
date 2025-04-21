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
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $admins = User::whereIn('role', ['adminbem', 'adminmpm'])
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info('Admins data in index:', ['admins' => $admins->toArray()]);

        return Inertia::render('Admin/OrganizationAdmin/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
            'admins' => $admins,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/OrganizationAdmin/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
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

        User::create([
            'username' => $request->username,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => 'active',
        ]);

        return Inertia::render('Admin/OrganizationAdmin/index', [
            'auth' => ['user' => Auth::user()],
            'userRole' => strtolower(Auth::user()->role),
            'permissions' => RoleHelper::getRolePermissions(strtolower(Auth::user()->role)),
            'navigation' => RoleHelper::getNavigationMenu(strtolower(Auth::user()->role)),
            'admins' => User::whereIn('role', ['adminbem', 'adminmpm'])->orderBy('created_at', 'desc')->get(),
            'notification' => ['type' => 'success', 'message' => 'Admin organisasi berhasil ditambahkan.'],
        ]);
    }

    public function toggleStatus(User $user)
    {
        if (!in_array($user->role, ['adminbem', 'adminmpm'])) {
            return Inertia::render('Admin/OrganizationAdmin/index', [
                'auth' => ['user' => Auth::user()],
                'userRole' => strtolower(Auth::user()->role),
                'permissions' => RoleHelper::getRolePermissions(strtolower(Auth::user()->role)),
                'navigation' => RoleHelper::getNavigationMenu(strtolower(Auth::user()->role)),
                'admins' => User::whereIn('role', ['adminbem', 'adminmpm'])->orderBy('created_at', 'desc')->get(),
                'notification' => ['type' => 'error', 'message' => 'User tidak valid untuk diubah statusnya.'],
            ]);
        }

        $user->update([
            'status' => $user->status === 'active' ? 'inactive' : 'active',
        ]);

        return Inertia::render('Admin/OrganizationAdmin/index', [
            'auth' => ['user' => Auth::user()],
            'userRole' => strtolower(Auth::user()->role),
            'permissions' => RoleHelper::getRolePermissions(strtolower(Auth::user()->role)),
            'navigation' => RoleHelper::getNavigationMenu(strtolower(Auth::user()->role)),
            'admins' => User::whereIn('role', ['adminbem', 'adminmpm'])->orderBy('created_at', 'desc')->get(),
            'notification' => ['type' => 'success', 'message' => 'Status admin organisasi berhasil diubah.'],
        ]);
    }

    public function editPassword(User $admin)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        Log::info('Accessing editPassword for user:', ['admin_id' => $admin->id, 'admin_role' => $admin->role]);

        // Pengecekan role sementara dihapus untuk debugging
        // if (!in_array($admin->role, ['adminbem', 'adminmpm'])) {
        //     return Inertia::render('Admin/OrganizationAdmin/index', [
        //         'auth' => ['user' => $user],
        //         'userRole' => $role,
        //         'permissions' => $permissions,
        //         'navigation' => $menuItems,
        //         'admins' => User::whereIn('role', ['adminbem', 'adminmpm'])->orderBy('created_at', 'desc')->get(),
        //         'notification' => ['type' => 'error', 'message' => 'User tidak valid untuk diubah passwordnya.'],
        //     ]);
        // }

        return Inertia::render('Admin/OrganizationAdmin/editPassword', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'navigation' => $menuItems,
            'admin' => $admin,
        ]);
    }

    public function updatePassword(Request $request, User $admin)
    {
        Log::info('Attempting to update password for user:', ['admin_id' => $admin->id, 'admin_role' => $admin->role]);

        if (!in_array($admin->role, ['adminbem', 'adminmpm'])) {
            Log::warning('User role invalid for password update:', ['admin_id' => $admin->id, 'admin_role' => $admin->role]);
            return Inertia::render('Admin/OrganizationAdmin/index', [
                'auth' => ['user' => Auth::user()],
                'userRole' => strtolower(Auth::user()->role),
                'permissions' => RoleHelper::getRolePermissions(strtolower(Auth::user()->role)),
                'navigation' => RoleHelper::getNavigationMenu(strtolower(Auth::user()->role)),
                'admins' => User::whereIn('role', ['adminbem', 'adminmpm'])->orderBy('created_at', 'desc')->get(),
                'notification' => ['type' => 'error', 'message' => 'User tidak valid untuk diubah passwordnya.'],
            ]);
        }

        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        Log::info('Validation passed, updating password for user:', ['user_id' => $admin->id, 'username' => $admin->username]);

        try {
            $admin->update([
                'password' => Hash::make($request->password),
            ]);

            $updatedUser = User::find($admin->id);
            if (!Hash::check($request->password, $updatedUser->password)) {
                Log::error('Password update failed for user:', ['user_id' => $admin->id, 'username' => $admin->username]);
                return Inertia::render('Admin/OrganizationAdmin/index', [
                    'auth' => ['user' => Auth::user()],
                    'userRole' => strtolower(Auth::user()->role),
                    'permissions' => RoleHelper::getRolePermissions(strtolower(Auth::user()->role)),
                    'navigation' => RoleHelper::getNavigationMenu(strtolower(Auth::user()->role)),
                    'admins' => User::whereIn('role', ['adminbem', 'adminmpm'])->orderBy('created_at', 'desc')->get(),
                    'notification' => ['type' => 'error', 'message' => 'Gagal memperbarui password. Silakan coba lagi.'],
                ]);
            }

            Log::info('Password updated successfully for user:', ['user_id' => $admin->id, 'username' => $admin->username]);
        } catch (\Exception $e) {
            Log::error('Exception during password update:', ['error' => $e->getMessage(), 'user_id' => $admin->id]);
            return Inertia::render('Admin/OrganizationAdmin/index', [
                'auth' => ['user' => Auth::user()],
                'userRole' => strtolower(Auth::user()->role),
                'permissions' => RoleHelper::getRolePermissions(strtolower(Auth::user()->role)),
                'navigation' => RoleHelper::getNavigationMenu(strtolower(Auth::user()->role)),
                'admins' => User::whereIn('role', ['adminbem', 'adminmpm'])->orderBy('created_at', 'desc')->get(),
                'notification' => ['type' => 'error', 'message' => 'Terjadi kesalahan saat memperbarui password: ' . $e->getMessage()],
            ]);
        }

        return Inertia::render('Admin/OrganizationAdmin/index', [
            'auth' => ['user' => Auth::user()],
            'userRole' => strtolower(Auth::user()->role),
            'permissions' => RoleHelper::getRolePermissions(strtolower(Auth::user()->role)),
            'navigation' => RoleHelper::getNavigationMenu(strtolower(Auth::user()->role)),
            'admins' => User::whereIn('role', ['adminbem', 'adminmpm'])->orderBy('created_at', 'desc')->get(),
            'notification' => ['type' => 'success', 'message' => 'Password admin organisasi berhasil diubah.'],
        ]);
    }
}