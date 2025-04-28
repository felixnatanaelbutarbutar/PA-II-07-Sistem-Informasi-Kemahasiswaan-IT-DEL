<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrganizationAdminController extends Controller
{
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

        Log::info('Attempting to set role for user:', [
            'nim' => $request->nim,
            'email' => $request->email,
            'role' => $request->role,
        ]);

        // Cari user berdasarkan NIM atau email
        $user = User::where('nim', $request->nim)
            ->orWhere('email', $request->email)
            ->first();

        // Jika role diubah menjadi 'mahasiswa', hapus user dari tabel users
        if ($request->role === 'mahasiswa') {
            if ($user) {
                try {
                    Log::info('Deleting user from users table:', ['nim' => $user->nim, 'email' => $user->email]);
                    $user->delete();
                    Log::info('User deleted successfully:', ['nim' => $request->nim]);
                } catch (\Exception $e) {
                    Log::error('Error deleting user:', ['error' => $e->getMessage()]);
                    return redirect()->back()->with('notification', ['type' => 'error', 'message' => 'Gagal menghapus user: ' . $e->getMessage()]);
                }
                return redirect()->back()->with('notification', ['type' => 'success', 'message' => 'User berhasil dihapus dari daftar admin organisasi.']);
            }
            Log::info('No user found to delete:', ['nim' => $request->nim]);
            return redirect()->back()->with('notification', ['type' => 'success', 'message' => 'Tidak ada perubahan, user belum terdaftar sebagai admin.']);
        }

        // Jika role adalah adminbem atau adminmpm, update atau buat user
        try {
            if ($user) {
                Log::info('Updating existing user:', ['nim' => $user->nim, 'old_role' => $user->role, 'new_role' => $request->role]);
                $user->update([
                    'role' => $request->role,
                    'status' => 'active',
                ]);
                Log::info('User updated successfully:', ['nim' => $user->nim, 'new_role' => $user->role]);
            } else {
                Log::info('Creating new user:', ['nim' => $request->nim, 'role' => $request->role]);
                $user = User::create([
                    'username' => $request->username,
                    'email' => $request->email,
                    'name' => $request->name,
                    'nim' => $request->nim,
                    'prodi' => $request->prodi,
                    'role' => $request->role,
                    'status' => 'active',
                ]);
                Log::info('User created successfully:', ['nim' => $user->nim, 'role' => $user->role]);
            }
        } catch (\Exception $e) {
            Log::error('Error setting role:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('notification', ['type' => 'error', 'message' => 'Gagal memperbarui role: ' . $e->getMessage()]);
        }

        return redirect()->back()->with('notification', ['type' => 'success', 'message' => 'Role berhasil diperbarui untuk ' . $user->name]);
    }
}