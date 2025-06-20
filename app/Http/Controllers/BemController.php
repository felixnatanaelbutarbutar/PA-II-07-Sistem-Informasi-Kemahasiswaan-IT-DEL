<?php

namespace App\Http\Controllers;

use App\Models\BEM;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class BemController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $bems = BEM::with(['creator', 'updater'])->get(); // Ambil semua data BEM
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $flashSuccess = session('success');
        Log::info('Flash message in BEM index: ' . ($flashSuccess ?? 'No flash message'));

        return Inertia::render('Admin/Bem/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'bems' => $bems, // Ganti 'bem' dengan 'bems' untuk daftar
            'menu' => $menuItems,
            'navigation' => $menuItems,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $bemExists = BEM::exists();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Bem/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'navigation' => $menuItems,
            'bemExists' => $bemExists,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Request data:', $request->all());
        Log::info('Request files:', $request->files->all());

        try {
            $validated = $request->validate([
                'introduction' => 'required|string',
                'vision' => 'required|string',
                'mission' => 'required|json',
                'structure' => 'required|json',
                'work_programs' => 'required|json',
                'logo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'recruitment_status' => 'required|in:OPEN,CLOSED',
                'is_active' => 'required|boolean',
                'cabinet_name' => 'required|string', // Validasi cabinet_name
                'positions.*' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'departments.*.members.*' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
            ]);

            Log::info('Validation passed');

            if ($validated['is_active']) {
                BEM::where('is_active', true)->update(['is_active' => false]); // Pastikan hanya satu yang aktif
            }

            $structure = json_decode($request->input('structure'), true);

            if (!empty($structure['positions'])) {
                foreach ($structure['positions'] as $positionIndex => &$position) {
                    if ($request->hasFile("positions.{$positionIndex}")) {
                        $path = $request->file("positions.{$positionIndex}")->store('bem_photos', 'public');
                        Log::info("Position {$positionIndex} photo uploaded to: " . $path);
                        $position['photo'] = $path;
                    } else {
                        $position['photo'] = null;
                    }
                }
            }

            if (!empty($structure['departments'])) {
                foreach ($structure['departments'] as $deptIndex => &$department) {
                    if (!empty($department['members'])) {
                        foreach ($department['members'] as $memberIndex => &$member) {
                            if ($request->hasFile("departments.{$deptIndex}.members.{$memberIndex}")) {
                                $path = $request->file("departments.{$deptIndex}.members.{$memberIndex}")->store('bem_photos', 'public');
                                Log::info("Department {$deptIndex} member {$memberIndex} photo uploaded to: " . $path);
                                $member['photo'] = $path;
                            } else {
                                $member['photo'] = null;
                            }
                        }
                    }
                }
            }

            $logoPath = null;
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('bem_logos', 'public');
                Log::info('Logo uploaded to: ' . $logoPath);
            }

            Log::info('Structure data after processing:', $structure);

            BEM::create([
                'introduction' => $validated['introduction'],
                'vision' => $validated['vision'],
                'mission' => json_decode($validated['mission'], true),
                'structure' => $structure,
                'work_programs' => json_decode($validated['work_programs'], true),
                'logo' => $logoPath,
                'recruitment_status' => $validated['recruitment_status'],
                'is_active' => $validated['is_active'],
                'cabinet_name' => $validated['cabinet_name'], // Simpan cabinet_name
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            return redirect()->route('admin.bem.index')->with('success', 'Data BEM berhasil dibuat.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error saving BEM data: ' . $e->getMessage());
            return redirect()->route('admin.bem.index')->with('error', 'Gagal membuat data BEM: ' . $e->getMessage());
        }
    }

    public function edit($id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $bem = BEM::with(['creator', 'updater'])->findOrFail($id);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Bem/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'bem' => $bem,
            'menu' => $menuItems,
            'navigation' => $menuItems,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $bem = BEM::findOrFail($id);

        Log::info('Update request data:', $request->all());
        Log::info('Update request files:', $request->files->all());

        // Hapus cache agar data baru tampil di API
        Cache::forget('bem');
        try {
            $validated = $request->validate([
                'introduction' => 'required|string',
                'vision' => 'required|string',
                'mission' => 'required|json',
                'structure' => 'required|json',
                'work_programs' => 'required|json',
                'logo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'recruitment_status' => 'required|in:OPEN,CLOSED',
                'is_active' => 'required|boolean',
                'cabinet_name' => 'required|string', // Validasi cabinet_name
                'positions.*' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'departments.*.members.*' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            Log::info('Validation passed');

            if ($validated['is_active'] && !$bem->is_active) {
                BEM::where('is_active', true)->update(['is_active' => false]); // Pastikan hanya satu yang aktif
            }

            $structure = json_decode($request->input('structure'), true);

            if (!empty($structure['positions'])) {
                foreach ($structure['positions'] as $positionIndex => &$position) {
                    if ($request->hasFile("positions.{$positionIndex}")) {
                        $oldPhoto = $bem->structure['positions'][$positionIndex]['photo'] ?? null;
                        if ($oldPhoto) {
                            Storage::disk('public')->delete($oldPhoto);
                        }
                        $path = $request->file("positions.{$positionIndex}")->store('bem_photos', 'public');
                        Log::info("Position {$positionIndex} photo uploaded to: " . $path);
                        $position['photo'] = $path;
                    } else {
                        $position['photo'] = $bem->structure['positions'][$positionIndex]['photo'] ?? null;
                    }
                }
            }

            if (!empty($structure['departments'])) {
                foreach ($structure['departments'] as $deptIndex => &$department) {
                    if (!empty($department['members'])) {
                        foreach ($department['members'] as $memberIndex => &$member) {
                            if ($request->hasFile("departments.{$deptIndex}.members.{$memberIndex}")) {
                                $oldPhoto = $bem->structure['departments'][$deptIndex]['members'][$memberIndex]['photo'] ?? null;
                                if ($oldPhoto) {
                                    Storage::disk('public')->delete($oldPhoto);
                                }
                                $path = $request->file("departments.{$deptIndex}.members.{$memberIndex}")->store('bem_photos', 'public');
                                Log::info("Department {$deptIndex} member {$memberIndex} photo uploaded to: " . $path);
                                $member['photo'] = $path;
                            } else {
                                $member['photo'] = $bem->structure['departments'][$deptIndex]['members'][$memberIndex]['photo'] ?? null;
                            }
                        }
                    }
                }
            }

            $logoPath = $bem->logo;
            if ($request->hasFile('logo')) {
                if ($logoPath) {
                    Storage::disk('public')->delete($logoPath);
                }
                $logoPath = $request->file('logo')->store('bem_logos', 'public');
                Log::info('Logo updated to: ' . $logoPath);
            }

            Log::info('Structure data after processing:', $structure);

            $bem->update([
                'introduction' => $validated['introduction'],
                'vision' => $validated['vision'],
                'mission' => json_decode($validated['mission'], true),
                'structure' => $structure,
                'work_programs' => json_decode($validated['work_programs'], true),
                'logo' => $logoPath,
                'recruitment_status' => $validated['recruitment_status'],
                'is_active' => $validated['is_active'],
                'cabinet_name' => $validated['cabinet_name'], // Update cabinet_name
                'updated_by' => Auth::id(),
            ]);

            return redirect()->route('admin.bem.index')->with('success', 'Data BEM berhasil diperbarui.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating BEM data: ' . $e->getMessage());
            return redirect()->route('admin.bem.index')->with('error', 'Gagal memperbarui data BEM: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $bem = BEM::findOrFail($id);
            Log::info('Attempting to delete BEM with ID: ' . $id);

            if (!empty($bem->structure['positions'])) {
                foreach ($bem->structure['positions'] as $position) {
                    if (!empty($position['photo'])) {
                        Log::info('Deleting position photo: ' . $position['photo']);
                        Storage::disk('public')->delete($position['photo']);
                    }
                }
            }

            if (!empty($bem->structure['departments'])) {
                foreach ($bem->structure['departments'] as $department) {
                    if (!empty($department['members'])) {
                        foreach ($department['members'] as $member) {
                            if (!empty($member['photo'])) {
                                Log::info('Deleting member photo: ' . $member['photo']);
                                Storage::disk('public')->delete($member['photo']);
                            }
                        }
                    }
                }
            }

            if ($bem->logo) {
                Log::info('Deleting logo: ' . $bem->logo);
                Storage::disk('public')->delete($bem->logo);
            }

            $bem->delete();
            Log::info('BEM deleted successfully');

            return redirect()->route('admin.bem.index')->with('success', 'Data BEM berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting BEM data: ' . $e->getMessage());
            return redirect()->route('admin.bem.index')->with('error', 'Gagal menghapus data BEM: ' . $e->getMessage());
        }
    }

    public function showDetail($id)
    {
        $user = Auth::user();
        $role = $user ? strtolower($user->role) : null;

        $bem = BEM::with(['creator', 'updater'])->findOrFail($id);
        $menuItems = $role ? RoleHelper::getNavigationMenu($role) : [];
        $permissions = $role ? RoleHelper::getRolePermissions($role) : [];

        return Inertia::render('Admin/Bem/detail', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'bem' => $bem,
            'menu' => $menuItems,
            'navigation' => $menuItems,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function toggleActive($id)
    {
        try {
            $bem = BEM::findOrFail($id);

            if (!$bem->is_active) {
                BEM::where('is_active', true)->update(['is_active' => false]);
                $bem->is_active = true;
                $message = 'Data BEM diaktifkan dengan sukses.';
            } else {
                $bem->is_active = false;
                $message = 'Data BEM dinonaktifkan dengan sukses.';
            }

            $bem->update(['updated_by' => Auth::id()]);
            Log::info('BEM toggled to ' . ($bem->is_active ? 'active' : 'inactive') . ' with ID: ' . $bem->id);

            return redirect()->route('admin.bem.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Error toggling BEM status: ' . $e->getMessage());
            return redirect()->route('admin.bem.index')->with('error', 'Gagal mengubah status BEM: ' . $e->getMessage());
        }
    }

    public function show()
    {
        $bem = BEM::where('is_active', true)->first();

        return Inertia::render('BEM', [
            'bem' => $bem,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }
}
