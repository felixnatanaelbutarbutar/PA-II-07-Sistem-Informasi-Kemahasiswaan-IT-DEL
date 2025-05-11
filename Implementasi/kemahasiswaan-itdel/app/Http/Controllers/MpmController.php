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

        $mpm = Mpm::with(['createdBy', 'updatedBy'])->first();
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
            'mpm' => $mpm,
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
                'secretary_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'commissions.*.chairman_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'commissions.*.members.*.photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
            ]);

            Log::info('Validation passed');

            $structure = json_decode($request->input('structure'), true);

            // Proses foto untuk Ketua
            if ($request->hasFile('chairman_photo')) {
                $path = $request->file('chairman_photo')->store('mpm_photos', 'public');
                Log::info('Chairman photo uploaded to: ' . $path);
                $structure['chairman']['photo'] = $path;
            } else {
                $structure['chairman']['photo'] = null;
            }

            // Proses foto untuk Sekretaris
            if ($request->hasFile('secretary_photo')) {
                $path = $request->file('secretary_photo')->store('mpm_photos', 'public');
                Log::info('Secretary photo uploaded to: ' . $path);
                $structure['secretary']['photo'] = $path;
            } else {
                $structure['secretary']['photo'] = null;
            }

            // Proses foto untuk komisi
            if (!empty($structure['commissions'])) {
                foreach ($structure['commissions'] as $commissionIndex => &$commission) {
                    if ($request->hasFile("commissions.{$commissionIndex}.chairman_photo")) {
                        $path = $request->file("commissions.{$commissionIndex}.chairman_photo")->store('mpm_photos', 'public');
                        Log::info("Commission {$commissionIndex} chairman photo uploaded to: " . $path);
                        $commission['chairman']['photo'] = $path;
                    } else {
                        $commission['chairman']['photo'] = null;
                    }

                    if (!empty($commission['members'])) {
                        foreach ($commission['members'] as $memberIndex => &$member) {
                            if ($request->hasFile("commissions.{$commissionIndex}.members.{$memberIndex}.photo")) {
                                $path = $request->file("commissions.{$commissionIndex}.members.{$memberIndex}.photo")->store('mpm_photos', 'public');
                                Log::info("Commission {$commissionIndex} member {$memberIndex} photo uploaded to: " . $path);
                                $member['photo'] = $path;
                            } else {
                                $member['photo'] = null;
                            }
                        }
                    }
                }
            }

            // Proses file logo
            $logoPath = null;
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('mpm_logos', 'public');
                Log::info('Logo uploaded to: ' . $logoPath);
            }

            Log::info('Structure data after processing:', $structure);

            Mpm::create([
                'introduction' => $request->introduction,
                'vision' => $request->vision,
                'mission' => json_decode($request->mission, true),
                'structure' => $structure,
                'logo' => $logoPath,
                'recruitment_status' => $request->recruitment_status,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            return response()->json(['message' => 'Data MPM berhasil dibuat.'], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error saving MPM data: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal membuat data MPM: ' . $e->getMessage()], 500);
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
                'secretary_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'commissions.*.chairman_photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'commissions.*.members.*.photo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            Log::info('Validation passed');

            $structure = json_decode($request->input('structure'), true);

            // Proses foto untuk Ketua
            if ($request->hasFile('chairman_photo')) {
                $oldPhoto = $mpm->structure['chairman']['photo'] ?? null;
                if ($oldPhoto) {
                    Storage::disk('public')->delete($oldPhoto);
                }
                $path = $request->file('chairman_photo')->store('mpm_photos', 'public');
                Log::info('Chairman photo updated to: ' . $path);
                $structure['chairman']['photo'] = $path;
            } else {
                $structure['chairman']['photo'] = $mpm->structure['chairman']['photo'] ?? null;
            }

            // Proses foto untuk Sekretaris
            if ($request->hasFile('secretary_photo')) {
                $oldPhoto = $mpm->structure['secretary']['photo'] ?? null;
                if ($oldPhoto) {
                    Storage::disk('public')->delete($oldPhoto);
                }
                $path = $request->file('secretary_photo')->store('mpm_photos', 'public');
                Log::info('Secretary photo updated to: ' . $path);
                $structure['secretary']['photo'] = $path;
            } else {
                $structure['secretary']['photo'] = $mpm->structure['secretary']['photo'] ?? null;
            }

            // Proses foto untuk komisi
            if (!empty($structure['commissions'])) {
                foreach ($structure['commissions'] as $commissionIndex => &$commission) {
                    // Foto Ketua Komisi
                    if ($request->hasFile("commissions.{$commissionIndex}.chairman_photo")) {
                        $oldPhoto = $mpm->structure['commissions'][$commissionIndex]['chairman']['photo'] ?? null;
                        if ($oldPhoto) {
                            Storage::disk('public')->delete($oldPhoto);
                        }
                        $path = $request->file("commissions.{$commissionIndex}.chairman_photo")->store('mpm_photos', 'public');
                        Log::info("Commission {$commissionIndex} chairman photo updated to: " . $path);
                        $commission['chairman']['photo'] = $path;
                    } else {
                        $commission['chairman']['photo'] = $mpm->structure['commissions'][$commissionIndex]['chairman']['photo'] ?? null;
                    }

                    // Foto Anggota Komisi
                    if (!empty($commission['members'])) {
                        foreach ($commission['members'] as $memberIndex => &$member) {
                            if ($request->hasFile("commissions.{$commissionIndex}.members.{$memberIndex}.photo")) {
                                $oldPhoto = $mpm->structure['commissions'][$commissionIndex]['members'][$memberIndex]['photo'] ?? null;
                                if ($oldPhoto) {
                                    Storage::disk('public')->delete($oldPhoto);
                                }
                                $path = $request->file("commissions.{$commissionIndex}.members.{$memberIndex}.photo")->store('mpm_photos', 'public');
                                Log::info("Commission {$commissionIndex} member {$memberIndex} photo updated to: " . $path);
                                $member['photo'] = $path;
                            } else {
                                $member['photo'] = $mpm->structure['commissions'][$commissionIndex]['members'][$memberIndex]['photo'] ?? null;
                            }
                        }
                    }
                }
            }

            // Proses file logo
            $logoPath = $mpm->logo;
            if ($request->hasFile('logo')) {
                if ($logoPath) {
                    Storage::disk('public')->delete($logoPath);
                }
                $logoPath = $request->file('logo')->store('mpm_logos', 'public');
                Log::info('Logo updated to: ' . $logoPath);
            }

            Log::info('Structure data after processing:', $structure);

            $mpm->update([
                'introduction' => $request->introduction,
                'vision' => $request->vision,
                'mission' => json_decode($request->mission, true),
                'structure' => $structure,
                'logo' => $logoPath,
                'recruitment_status' => $request->recruitment_status,
                'updated_by' => Auth::id(),
            ]);

            return redirect()->route('admin.mpm.index')->with('success', 'Data MPM berhasil diperbarui.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating MPM data: ' . $e->getMessage());
            return redirect()->route('admin.mpm.index')->with('error', 'Gagal memperbarui data MPM: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $mpm = Mpm::findOrFail($id);
            Log::info('Attempting to delete MPM with ID: ' . $id);

            // Hapus foto Ketua
            if (!empty($mpm->structure['chairman']['photo'])) {
                Log::info('Deleting chairman photo: ' . $mpm->structure['chairman']['photo']);
                Storage::disk('public')->delete($mpm->structure['chairman']['photo']);
            }

            // Hapus foto Sekretaris
            if (!empty($mpm->structure['secretary']['photo'])) {
                Log::info('Deleting secretary photo: ' . $mpm->structure['secretary']['photo']);
                Storage::disk('public')->delete($mpm->structure['secretary']['photo']);
            }

            // Hapus foto komisi
            if (!empty($mpm->structure['commissions'])) {
                foreach ($mpm->structure['commissions'] as $commission) {
                    // Foto Ketua Komisi
                    if (!empty($commission['chairman']['photo'])) {
                        Log::info('Deleting commission chairman photo: ' . $commission['chairman']['photo']);
                        Storage::disk('public')->delete($commission['chairman']['photo']);
                    }

                    // Foto Anggota Komisi
                    if (!empty($commission['members'])) {
                        foreach ($commission['members'] as $member) {
                            if (!empty($member['photo'])) {
                                Log::info('Deleting member photo: ' . $member['photo']);
                                Storage::disk('public')->delete($member['photo']);
                            }
                        }
                    }
                }
            }

            // Hapus logo
            if ($mpm->logo) {
                Log::info('Deleting logo: ' . $mpm->logo);
                Storage::disk('public')->delete($mpm->logo);
            }

            $mpm->delete();
            Log::info('MPM deleted successfully');

            return redirect()->route('admin.mpm.index')->with('success', 'Data MPM berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting MPM data: ' . $e->getMessage());
            return redirect()->route('admin.mpm.index')->with('error', 'Gagal menghapus data MPM: ' . $e->getMessage());
        }
    }

    public function show()
    {
        $mpm = Mpm::first();

        return Inertia::render('MPM', [
            'mpm' => $mpm,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }
}
