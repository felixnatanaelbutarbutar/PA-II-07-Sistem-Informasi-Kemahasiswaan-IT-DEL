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
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $bem = BEM::first();
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
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

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
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Debugging: Log semua data yang diterima dari request
        Log::info('Request data:', $request->all());
        Log::info('Request files:', $request->files->all());

        try {
            // Validasi bertahap
            $validated = $request->validate([
                'vision' => 'required|string',
                'mission' => 'required|string',
                'structure' => 'required|array',
                'structure.Ketua BEM' => 'required|array',
                'structure.Ketua BEM.name' => 'required|string',
                'structure.Ketua BEM.photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5048',
                'structure.Sekretaris' => 'required|array',
                'structure.Sekretaris.name' => 'required|string',
                'structure.Sekretaris.photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5048',
                'structure.departments' => 'nullable|array',
                'structure.departments.*.name' => 'required|string',
                'structure.departments.*.members' => 'nullable|array',
                'structure.departments.*.members.*.position' => 'required|string',
                'structure.departments.*.members.*.name' => 'required|string',
                'structure.departments.*.members.*.photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'work_programs' => 'required|array',
                'work_programs.*' => 'required|string',
                'recruitment_status' => 'required|in:OPEN,CLOSED',
            ]);

            Log::info('Validation passed'); // Debugging

            $structure = $request->input('structure');

            // Debugging: Log struktur data sebelum diproses
            Log::info('Structure data before processing:', $structure);

            // Handle photo upload for Ketua BEM
            if ($request->hasFile('structure.Ketua BEM.photo')) {
                $path = $request->file('structure.Ketua BEM.photo')->store('bem_photos', 'public');
                Log::info('Ketua BEM photo uploaded to: ' . $path);
                $structure['Ketua BEM']['photo'] = $path;
            } else {
                $structure['Ketua BEM']['photo'] = null;
            }

            // Handle photo upload for Sekretaris
            if ($request->hasFile('structure.Sekretaris.photo')) {
                $path = $request->file('structure.Sekretaris.photo')->store('bem_photos', 'public');
                Log::info('Sekretaris photo uploaded to: ' . $path);
                $structure['Sekretaris']['photo'] = $path;
            } else {
                $structure['Sekretaris']['photo'] = null;
            }

            // Handle photo upload for department members
            if (!empty($structure['departments'])) {
                foreach ($structure['departments'] as $deptIndex => $department) {
                    if (!empty($department['members'])) {
                        foreach ($department['members'] as $memberIndex => $member) {
                            $photoKey = "structure.departments.{$deptIndex}.members.{$memberIndex}.photo";
                            if ($request->hasFile($photoKey)) {
                                $path = $request->file($photoKey)->store('bem_photos', 'public');
                                Log::info("Department {$deptIndex} member {$memberIndex} photo uploaded to: " . $path);
                                $structure['departments'][$deptIndex]['members'][$memberIndex]['photo'] = $path;
                            } else {
                                $structure['departments'][$deptIndex]['members'][$memberIndex]['photo'] = null;
                            }
                        }
                    }
                }
            }

            // Debugging: Log struktur data setelah diproses
            Log::info('Structure data after processing:', $structure);

            // Simpan data
            BEM::create([
                'vision' => $request->vision,
                'mission' => $request->mission,
                'structure' => $structure,
                'work_programs' => $request->work_programs,
                'recruitment_status' => $request->recruitment_status,
            ]);

            return redirect()->route('admin.bem.index')->with('success', 'Data BEM berhasil dibuat.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log error validasi
            Log::error('Validation failed: ' . json_encode($e->errors()));
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Log error lainnya
            Log::error('Error saving BEM data: ' . $e->getMessage());
            return redirect()->route('admin.bem.index')->with('error', 'Gagal membuat data BEM: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $bem = BEM::findOrFail($id);
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
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $bem = BEM::findOrFail($id);

        // Debugging: Log semua data yang diterima dari request
        Log::info('Update request data:', $request->all());
        Log::info('Update request files:', $request->files->all());

        $validated = $request->validate([
            'vision' => 'required|string',
            'mission' => 'required|string',
            'structure' => 'required|array',
            'structure.Ketua BEM.name' => 'required|string',
            'structure.Ketua BEM.photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'structure.Sekretaris.name' => 'required|string',
            'structure.Sekretaris.photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'structure.departments' => 'nullable|array',
            'structure.departments.*.name' => 'required|string',
            'structure.departments.*.members' => 'nullable|array',
            'structure.departments.*.members.*.position' => 'required|string',
            'structure.departments.*.members.*.name' => 'required|string',
            'structure.departments.*.members.*.photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'work_programs' => 'required|array',
            'work_programs.*' => 'required|string',
            'recruitment_status' => 'required|in:OPEN,CLOSED',
        ]);

        try {
            $structure = $request->input('structure');

            // Handle photo upload for Ketua BEM
            if ($request->hasFile('structure.Ketua BEM.photo')) {
                if (!empty($bem->structure['Ketua BEM']['photo'])) {
                    Storage::disk('public')->delete($bem->structure['Ketua BEM']['photo']);
                }
                $path = $request->file('structure.Ketua BEM.photo')->store('bem_photos', 'public');
                $structure['Ketua BEM']['photo'] = $path;
            } else {
                $structure['Ketua BEM']['photo'] = $bem->structure['Ketua BEM']['photo'] ?? null;
            }

            // Handle photo upload for Sekretaris
            if ($request->hasFile('structure.Sekretaris.photo')) {
                if (!empty($bem->structure['Sekretaris']['photo'])) {
                    Storage::disk('public')->delete($bem->structure['Sekretaris']['photo']);
                }
                $path = $request->file('structure.Sekretaris.photo')->store('bem_photos', 'public');
                $structure['Sekretaris']['photo'] = $path;
            } else {
                $structure['Sekretaris']['photo'] = $bem->structure['Sekretaris']['photo'] ?? null;
            }

            // Handle photo upload for department members
            if (!empty($structure['departments'])) {
                foreach ($structure['departments'] as $deptIndex => $department) {
                    if (!empty($department['members'])) {
                        foreach ($department['members'] as $memberIndex => $member) {
                            $photoKey = "structure.departments.{$deptIndex}.members.{$memberIndex}.photo";
                            if ($request->hasFile($photoKey)) {
                                $oldPhoto = $bem->structure['departments'][$deptIndex]['members'][$memberIndex]['photo'] ?? null;
                                if ($oldPhoto) {
                                    Storage::disk('public')->delete($oldPhoto);
                                }
                                $path = $request->file($photoKey)->store('bem_photos', 'public');
                                $structure['departments'][$deptIndex]['members'][$memberIndex]['photo'] = $path;
                            } else {
                                $structure['departments'][$deptIndex]['members'][$memberIndex]['photo'] = $bem->structure['departments'][$deptIndex]['members'][$memberIndex]['photo'] ?? null;
                            }
                        }
                    }
                }
            }

            $bem->update([
                'vision' => $request->vision,
                'mission' => $request->mission,
                'structure' => $structure,
                'work_programs' => $request->work_programs,
                'recruitment_status' => $request->recruitment_status,
            ]);

            return redirect()->route('admin.bem.index')->with('success', 'Data BEM berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Error updating BEM data: ' . $e->getMessage());
            return redirect()->route('admin.bem.index')->with('error', 'Gagal memperbarui data BEM: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $bem = BEM::findOrFail($id);

            if (!empty($bem->structure['Ketua BEM']['photo'])) {
                Storage::disk('public')->delete($bem->structure['Ketua BEM']['photo']);
            }
            if (!empty($bem->structure['Sekretaris']['photo'])) {
                Storage::disk('public')->delete($bem->structure['Sekretaris']['photo']);
            }
            if (!empty($bem->structure['departments'])) {
                foreach ($bem->structure['departments'] as $department) {
                    if (!empty($department['members'])) {
                        foreach ($department['members'] as $member) {
                            if (!empty($member['photo'])) {
                                Storage::disk('public')->delete($member['photo']);
                            }
                        }
                    }
                }
            }

            $bem->delete();
            return redirect()->route('admin.bem.index')->with('success', 'Data BEM berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting BEM data: ' . $e->getMessage());
            return redirect()->route('admin.bem.index')->with('error', 'Gagal menghapus data BEM: ' . $e->getMessage());
        }
    }
}
