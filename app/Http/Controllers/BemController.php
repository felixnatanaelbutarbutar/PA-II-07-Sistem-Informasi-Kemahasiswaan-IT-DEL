<?php

namespace App\Http\Controllers;

use App\Models\BEM;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class BemController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $bem = BEM::with(['creator', 'updater'])->first();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $flashSuccess = session('success');
        Log::info('Flash message in BEM index: ' . ($flashSuccess ?? 'No flash message'));

        return Inertia::render('Admin/Bem/index', [
            'auth' => [
                'user' => $user,
            ],
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

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $bemExists = BEM::exists();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Bem/add', [
            'auth' => [
                'user' => $user,
            ],
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
                'positions.*' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
                'departments.*.members.*' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:5096',
            ]);

            Log::info('Validation passed');

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
                'introduction' => $request->introduction,
                'vision' => $request->vision,
                'mission' => json_decode($request->mission, true),
                'structure' => $structure,
                'work_programs' => json_decode($request->work_programs, true),
                'logo' => $logoPath,
                'recruitment_status' => $request->recruitment_status,
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
            'auth' => [
                'user' => $user,
            ],
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

        try {
            $validated = $request->validate([
                'introduction' => 'required|string',
                'vision' => 'required|string',
                'mission' => 'required|json',
                'structure' => 'required|json',
                'work_programs' => 'required|json',
                'logo' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'recruitment_status' => 'required|in:OPEN,CLOSED',
                'positions.*' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'departments.*.members.*' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            Log::info('Validation passed');

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
                'introduction' => $request->introduction,
                'vision' => $request->vision,
                'mission' => json_decode($request->mission, true),
                'structure' => $structure,
                'work_programs' => json_decode($request->work_programs, true),
                'logo' => $logoPath,
                'recruitment_status' => $request->recruitment_status,
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

            return response()->json(['message' => 'Data BEM berhasil dihapus!'], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting BEM data: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal menghapus data BEM: ' . $e->getMessage()], 500);
        }
    }

    public function show()
    {
        $bem = BEM::first();

        return Inertia::render('BEM', [
            'bem' => $bem,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }
}