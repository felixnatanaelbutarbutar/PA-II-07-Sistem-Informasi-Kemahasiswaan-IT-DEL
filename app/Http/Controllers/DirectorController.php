<?php

namespace App\Http\Controllers;

use App\Models\Director;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class DirectorController extends Controller
{
    // Display the list of directors
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $directors = Director::with(['creator', 'updater'])->get()->map(function ($director) {
            return [
                'id' => $director->id,
                'director_id' => $director->director_id,
                'name' => $director->name,
                'welcome_message' => $director->welcome_message,
                'photo' => $director->photo ? Storage::url($director->photo) : null,
                'is_active' => $director->is_active,
                'created_by' => $director->creator ? $director->creator->name : null,
                'updated_by' => $director->updater ? $director->updater->name : null,
                'created_at' => $director->created_at,
                'updated_at' => $director->updated_at,
            ];
        });

        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        // Debugging flash message
        $flashSuccess = session('success');
        Log::info('Flash message in index: ' . ($flashSuccess ?? 'No flash message'));

        return Inertia::render('Admin/Directors/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'directors' => $directors,
            'menu' => $menuItems,
        ]);
    }

    // Generate automatic ID like "d001", "d002", "d003", ...
    private function generateDirectorId()
    {
        $lastDirector = Director::latest('director_id')->first();

        if ($lastDirector) {
            $lastNumber = (int)substr($lastDirector->director_id, 1);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return 'd' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    // Show the form to create a new director
    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Directors/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
        ]);
    }

    // Store a new director
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'welcome_message' => 'required|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
        ]);

        $user = Auth::user();

        // Generate automatic ID for director_id
        $directorId = $this->generateDirectorId();

        // Upload photo if provided
        $photoPath = null;
        if ($request->hasFile('photo')) {
            Log::info('Photo received: ' . $request->file('photo')->getClientOriginalName());
            $photoPath = $request->file('photo')->store('director_photos', 'public');
            Log::info('Photo stored at: ' . $photoPath);
        } else {
            Log::info('No photo uploaded');
        }

        // Create new director
        Director::create([
            'director_id' => $directorId,
            'name' => $request->name,
            'welcome_message' => $request->welcome_message,
            'photo' => $photoPath,
            'is_active' => $request->is_active ?? true, // Default to true if not provided
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('admin.directors.index')
            ->with('success', 'Director added successfully.');
    }

    // Show the form to edit an existing director
    public function edit($director_id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        // Fetch the director by ID
        $director = Director::with(['creator', 'updater'])->where('director_id', $director_id)->firstOrFail();
        $director->photo = $director->photo ? Storage::url($director->photo) : null;

        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Directors/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'director' => $director,
            'menu' => $menuItems,
        ]);
    }

    // Update a director
    public function update(Request $request, $director_id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'welcome_message' => 'required|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
        ]);

        $director = Director::findOrFail($director_id);

        // Check if a new photo is uploaded
        if ($request->hasFile('photo')) {
            // Delete the old photo if it exists
            if ($director->photo) {
                Storage::disk('public')->delete($director->photo);
            }
            $photoPath = $request->file('photo')->store('director_photos', 'public');
            Log::info('Photo updated at: ' . $photoPath);
            $director->photo = $photoPath;
        }

        $director->update([
            'name' => $request->name,
            'welcome_message' => $request->welcome_message,
            'photo' => $director->photo,
            'is_active' => $request->is_active ?? $director->is_active, // Retain old value if not changed
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('admin.directors.index')->with('success', 'Director updated successfully.');
    }

    // Delete a director
    public function destroy($director_id)
    {
        try {
            $director = Director::findOrFail($director_id);

            // Delete the photo if it exists
            if ($director->photo) {
                Storage::disk('public')->delete($director->photo);
            }

            $director->delete();

            return redirect()->route('admin.directors.index')->with('success', 'Director deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.directors.index')->with('error', 'Failed to delete director: ' . $e->getMessage());
        }
    }

    // Toggle the active status of a director
    public function toggleActive($id)
    {
        try {
            $director = Director::findOrFail($id);

            // Jika direktur ini diaktifkan, nonaktifkan semua direktur lain terlebih dahulu
            if (!$director->is_active) {
                Director::where('is_active', true)->update(['is_active' => false]);
                $director->is_active = true;
                $message = 'Data Direktur diaktifkan dengan sukses.';
            } else {
                $director->is_active = false;
                $message = 'DAta Direktur dinonaktifkan dengan sukses.';
            }

            $director->save();

            return redirect()->route('admin.directors.index')->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->route('admin.directors.index')->with('error', 'Gagal mengubah status direktur: ' . $e->getMessage());
        }
    }
}
