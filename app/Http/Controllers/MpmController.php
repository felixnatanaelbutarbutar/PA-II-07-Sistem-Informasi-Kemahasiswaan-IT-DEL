<?php

namespace App\Http\Controllers;

use App\Models\Mpm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class MpmController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $mpms = Mpm::with(['createdBy', 'updatedBy'])->get();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $flashSuccess = session('success');
        Log::info('Flash message in MPM index: ' . ($flashSuccess ?? 'No flash message'));

        return Inertia::render('Admin/Mpm/index', [
            'auth' => [
                'user' => $user,
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'mpms' => $mpms,
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

        $mpmExists = Mpm::exists();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Mpm/add', [
            'auth' => [
                'user' => $user,
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'navigation' => $menuItems,
            'mpmExists' => $mpmExists,
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
                'logo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'recruitment_status' => 'required|in:OPEN,CLOSED',
                'chairman_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'vice_chairman_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'secretary_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'commissions.*.chairman_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'commissions.*.members.*.photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'management_period' => 'required|string',
                'is_active' => 'required|boolean',
            ]);

            Log::info('Validation passed with is_active', ['is_active' => $validated['is_active']]);
            Log::info('Validation passed with management_period', ['management_period' => $validated['management_period']]);

            if ($validated['is_active']) {
                Mpm::where('is_active', true)->update(['is_active' => false]);
            }

            $structure = json_decode($request->input('structure'), true);

            if ($request->hasFile('chairman_photo')) {
                $path = $request->file('chairman_photo')->store('mpm_photos', 'public');
                Log::info('Chairman photo uploaded to', ['path' => $path]);
                $structure['chairman']['photo'] = $path;
            } else {
                $structure['chairman']['photo'] = null;
            }

            if ($request->hasFile('vice_chairman_photo')) {
                $path = $request->file('vice_chairman_photo')->store('mpm_photos', 'public');
                Log::info('Vice Chairman photo uploaded to', ['path' => $path]);
                $structure['vice_chairman']['photo'] = $path;
            } else {
                $structure['vice_chairman']['photo'] = null;
            }

            if ($request->hasFile('secretary_photo')) {
                $path = $request->file('secretary_photo')->store('mpm_photos', 'public');
                Log::info('Secretary photo uploaded to', ['path' => $path]);
                $structure['secretary']['photo'] = $path;
            } else {
                $structure['secretary']['photo'] = null;
            }

            if (!empty($structure['commissions'])) {
                foreach ($structure['commissions'] as $commissionIndex => &$commission) {
                    if ($request->hasFile("commissions.{$commissionIndex}.chairman_photo")) {
                        $path = $request->file("commissions.{$commissionIndex}.chairman_photo")->store('mpm_photos', 'public');
                        Log::info("Commission {$commissionIndex} chairman photo uploaded to", ['path' => $path]);
                        $commission['chairman']['photo'] = $path;
                    } else {
                        $commission['chairman']['photo'] = null;
                    }

                    if (!empty($commission['members'])) {
                        foreach ($commission['members'] as $memberIndex => &$member) {
                            if ($request->hasFile("commissions.{$commissionIndex}.members.{$memberIndex}.photo")) {
                                $path = $request->file("commissions.{$commissionIndex}.members.{$memberIndex}.photo")->store('mpm_photos', 'public');
                                Log::info("Commission {$commissionIndex} member {$memberIndex} photo uploaded to", ['path' => $path]);
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
                $logoPath = $request->file('logo')->store('mpm_logos', 'public');
                Log::info('Logo uploaded to', ['path' => $logoPath]);
            }

            Log::info('Structure data after processing', ['structure' => $structure]);

            Mpm::create([
                'introduction' => $validated['introduction'],
                'vision' => $validated['vision'],
                'mission' => json_decode($validated['mission'], true),
                'structure' => $structure,
                'logo' => $logoPath,
                'recruitment_status' => $validated['recruitment_status'],
                'management_period' => $validated['management_period'],
                'is_active' => $validated['is_active'],
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            return redirect()->route('admin.mpm.index')->with('success', 'Data MPM berhasil dibuat.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error saving MPM data', ['message' => $e->getMessage()]);
            return redirect()->route('admin.mpm.index')->with('error', 'Gagal membuat data MPM: ' . $e->getMessage());
        }
    }

    public function edit($id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $mpm = Mpm::with(['createdBy', 'updatedBy'])->findOrFail($id);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Mpm/edit', [
            'auth' => [
                'user' => $user,
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'mpm' => $mpm,
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
        $mpm = Mpm::findOrFail($id);

        Log::info('Update request data:', $request->all());
        Log::info('Update request files:', $request->files->all());

        try {
            $validated = $request->validate([
                'introduction' => 'required|string',
                'vision' => 'required|string',
                'mission' => 'required|json',
                'structure' => 'required|json',
                'logo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'recruitment_status' => 'required|in:OPEN,CLOSED',
                'chairman_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'vice_chairman_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'secretary_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'commissions.*.chairman_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'commissions.*.members.*.photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'management_period' => 'required|string',
                'is_active' => 'required|boolean',
            ]);

            Log::info('Validation passed');

            if ($validated['is_active']) {
                Mpm::where('id', '!=', $id)->where('is_active', true)->update(['is_active' => false]);
            }

            $structure = json_decode($request->input('structure'), true);

            if ($request->hasFile('chairman_photo')) {
                $oldPhoto = $mpm->structure['chairman']['photo'] ?? null;
                if ($oldPhoto && Storage::disk('public')->exists($oldPhoto)) {
                    Storage::disk('public')->delete($oldPhoto);
                }
                $path = $request->file('chairman_photo')->store('mpm_photos', 'public');
                Log::info('Chairman photo updated to', ['path' => $path]);
                $structure['chairman']['photo'] = $path;
            } else {
                $structure['chairman']['photo'] = $mpm->structure['chairman']['photo'] ?? null;
            }

            if ($request->hasFile('vice_chairman_photo')) {
                $oldPhoto = $mpm->structure['vice_chairman']['photo'] ?? null;
                if ($oldPhoto && Storage::disk('public')->exists($oldPhoto)) {
                    Storage::disk('public')->delete($oldPhoto);
                }
                $path = $request->file('vice_chairman_photo')->store('mpm_photos', 'public');
                Log::info('Vice Chairman photo updated to', ['path' => $path]);
                $structure['vice_chairman']['photo'] = $path;
            } else {
                $structure['vice_chairman']['photo'] = $mpm->structure['vice_chairman']['photo'] ?? null;
            }

            if ($request->hasFile('secretary_photo')) {
                $oldPhoto = $mpm->structure['secretary']['photo'] ?? null;
                if ($oldPhoto && Storage::disk('public')->exists($oldPhoto)) {
                    Storage::disk('public')->delete($oldPhoto);
                }
                $path = $request->file('secretary_photo')->store('mpm_photos', 'public');
                Log::info('Secretary photo updated to', ['path' => $path]);
                $structure['secretary']['photo'] = $path;
            } else {
                $structure['secretary']['photo'] = $mpm->structure['secretary']['photo'] ?? null;
            }

            if (!empty($structure['commissions'])) {
                foreach ($structure['commissions'] as $commissionIndex => &$commission) {
                    if ($request->hasFile("commissions.{$commissionIndex}.chairman_photo")) {
                        $oldPhoto = $mpm->structure['commissions'][$commissionIndex]['chairman']['photo'] ?? null;
                        if ($oldPhoto && Storage::disk('public')->exists($oldPhoto)) {
                            Storage::disk('public')->delete($oldPhoto);
                        }
                        $path = $request->file("commissions.{$commissionIndex}.chairman_photo")->store('mpm_photos', 'public');
                        Log::info("Commission {$commissionIndex} chairman photo updated to", ['path' => $path]);
                        $commission['chairman']['photo'] = $path;
                    } else {
                        $commission['chairman']['photo'] = $mpm->structure['commissions'][$commissionIndex]['chairman']['photo'] ?? null;
                    }

                    if (!empty($commission['members'])) {
                        foreach ($commission['members'] as $memberIndex => &$member) {
                            if ($request->hasFile("commissions.{$commissionIndex}.members.{$memberIndex}.photo")) {
                                $oldPhoto = $mpm->structure['commissions'][$commissionIndex]['members'][$memberIndex]['photo'] ?? null;
                                if ($oldPhoto && Storage::disk('public')->exists($oldPhoto)) {
                                    Storage::disk('public')->delete($oldPhoto);
                                }
                                $path = $request->file("commissions.{$commissionIndex}.members.{$memberIndex}.photo")->store('mpm_photos', 'public');
                                Log::info("Commission {$commissionIndex} member {$memberIndex} photo updated to", ['path' => $path]);
                                $member['photo'] = $path;
                            } else {
                                $member['photo'] = $mpm->structure['commissions'][$commissionIndex]['members'][$memberIndex]['photo'] ?? null;
                            }
                        }
                    }
                }
            }

            $logoPath = $mpm->logo;
            if ($request->hasFile('logo')) {
                if ($logoPath && Storage::disk('public')->exists($logoPath)) {
                    Storage::disk('public')->delete($logoPath);
                }
                $logoPath = $request->file('logo')->store('mpm_logos', 'public');
                Log::info('Logo updated to', ['path' => $logoPath]);
            }

            Log::info('Structure data after processing', ['structure' => $structure]);

            $mpm->update([
                'introduction' => $validated['introduction'],
                'vision' => $validated['vision'],
                'mission' => json_decode($validated['mission'], true),
                'structure' => $structure,
                'logo' => $logoPath,
                'recruitment_status' => $validated['recruitment_status'],
                'management_period' => $validated['management_period'],
                'is_active' => $validated['is_active'],
                'updated_by' => Auth::id(),
            ]);

            return redirect()->route('admin.mpm.index')->with('success', 'Data MPM berhasil diperbarui.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating MPM data', ['message' => $e->getMessage()]);
            return redirect()->route('admin.mpm.index')->with('error', 'Gagal memperbarui data MPM: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $mpm = Mpm::findOrFail($id);
            Log::info('Attempting to delete MPM with ID: ' . $id);

            if (!empty($mpm->structure['chairman']['photo']) && Storage::disk('public')->exists($mpm->structure['chairman']['photo'])) {
                Log::info('Deleting chairman photo: ' . $mpm->structure['chairman']['photo']);
                Storage::disk('public')->delete($mpm->structure['chairman']['photo']);
            }

            if (!empty($mpm->structure['vice_chairman']['photo']) && Storage::disk('public')->exists($mpm->structure['vice_chairman']['photo'])) {
                Log::info('Deleting vice chairman photo: ' . $mpm->structure['vice_chairman']['photo']);
                Storage::disk('public')->delete($mpm->structure['vice_chairman']['photo']);
            }

            if (!empty($mpm->structure['secretary']['photo']) && Storage::disk('public')->exists($mpm->structure['secretary']['photo'])) {
                Log::info('Deleting secretary photo: ' . $mpm->structure['secretary']['photo']);
                Storage::disk('public')->delete($mpm->structure['secretary']['photo']);
            }

            if (!empty($mpm->structure['commissions'])) {
                foreach ($mpm->structure['commissions'] as $commission) {
                    if (!empty($commission['chairman']['photo']) && Storage::disk('public')->exists($commission['chairman']['photo'])) {
                        Log::info('Deleting commission chairman photo: ' . $commission['chairman']['photo']);
                        Storage::disk('public')->delete($commission['chairman']['photo']);
                    }

                    if (!empty($commission['members'])) {
                        foreach ($commission['members'] as $member) {
                            if (!empty($member['photo']) && Storage::disk('public')->exists($member['photo'])) {
                                Log::info('Deleting member photo: ' . $member['photo']);
                                Storage::disk('public')->delete($member['photo']);
                            }
                        }
                    }
                }
            }

            if ($mpm->logo && Storage::disk('public')->exists($mpm->logo)) {
                Log::info('Deleting logo: ' . $mpm->logo);
                Storage::disk('public')->delete($mpm->logo);
            }

            $mpm->delete();
            Log::info('MPM deleted successfully');

            return redirect()->route('admin.mpm.index')->with('success', 'Data MPM berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting MPM data', ['message' => $e->getMessage()]);
            return redirect()->route('admin.mpm.index')->with('error', 'Gagal menghapus data MPM: ' . $e->getMessage());
        }
    }

    public function show()
    {
        $user = Auth::user();
        $role = $user ? strtolower($user->role) : null;

        $mpm = Mpm::where('is_active', true)
            ->with(['createdBy', 'updatedBy'])
            ->first(); // Ambil MPM aktif pertama (hanya satu data aktif)

        $menuItems = $role ? RoleHelper::getNavigationMenu($role) : [];
        $permissions = $role ? RoleHelper::getRolePermissions($role) : [];

        return Inertia::render('MPM', [
            'auth' => [
                'user' => $user,
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'mpm' => $mpm,
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
            $mpm = Mpm::findOrFail($id);

            if (!$mpm->is_active) {
                Mpm::where('is_active', true)->update(['is_active' => false]);
                $mpm->is_active = true;
                $message = 'Data MPM diaktifkan dengan sukses.';
            } else {
                $mpm->is_active = false;
                $message = 'Data MPM dinonaktifkan dengan sukses.';
            }

            $mpm->update(['updated_by' => Auth::id()]);
            Log::info('MPM toggled to ' . ($mpm->is_active ? 'active' : 'inactive') . ' with ID: ' . $mpm->id);

            return redirect()->route('admin.mpm.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Error toggling MPM status', ['message' => $e->getMessage()]);
            return redirect()->route('admin.mpm.index')->with('error', 'Gagal mengubah status MPM: ' . $e->getMessage());
        }
    }
    public function showDetail($id)
    {
        $user = Auth::user();
        $role = $user ? strtolower($user->role) : null;

        $mpm = Mpm::with(['createdBy', 'updatedBy'])->findOrFail($id);
        $menuItems = $role ? RoleHelper::getNavigationMenu($role) : [];
        $permissions = $role ? RoleHelper::getRolePermissions($role) : [];

        return Inertia::render('Admin/Mpm/detail', [
            'auth' => [
                'user' => $user,
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'mpm' => $mpm,
            'menu' => $menuItems,
            'navigation' => $menuItems,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }
}
