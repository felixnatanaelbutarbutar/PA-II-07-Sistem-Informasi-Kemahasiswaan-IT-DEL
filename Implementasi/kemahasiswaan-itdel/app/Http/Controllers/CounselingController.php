<?php

namespace App\Http\Controllers;

use App\Models\Counseling;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CounselingController extends Controller
{
    /**
     * Display the counseling form page for guests and mahasiswa.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('Counseling', [
            'auth' => [
                'user' => $user,
                'isMahasiswa' => $user && $user->role === 'mahasiswa',
            ],
        ]);
    }

    /**
     * Display a listing of counseling requests for admin (kemahasiswaan role).
     *
     * @return \Inertia\Response
     */
    public function indexAdmin()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        // Fetch counseling requests with the associated user (mahasiswa)
        $counselings = Counseling::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Transform the data to include all necessary user fields
        $counselings->getCollection()->transform(function ($counseling) {
            return [
                'id' => $counseling->id,
                'user' => [
                    'id' => $counseling->user->id,
                    'name' => $counseling->user->name,
                    'nim' => $counseling->user->nim,
                    'asrama' => $counseling->user->asrama,
                    'prodi' => $counseling->user->prodi,
                    'fakultas' => $counseling->user->fakultas,
                    'angkatan' => $counseling->user->angkatan,
                ],
                'issue' => $counseling->issue,
                'noTelephone' => $counseling->noTelephone,
                'status' => $counseling->status,
                'created_at' => $counseling->created_at,
                'updated_at' => $counseling->updated_at,
            ];
        });

        // Get navigation menu and permissions for the role
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/Counseling/index', [
            'auth' => [
                'user' => $user,
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'counselings' => $counselings,
        ]);
    }

    /**
     * Store a new counseling request (for mahasiswa).
     *
     * @param \Illuminate\Http\Request $request
    * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Ensure the user is logged in and has the role 'mahasiswa'
        if (!$user || $user->role !== 'mahasiswa') {
            return redirect()->route('login')->with('error', 'Anda harus login sebagai mahasiswa untuk mengirimkan permintaan konseling.');
        }

        // Validate the request
        $validated = $request->validate([
            'issue' => 'required|string|max:1000',
            'noTelephone' => 'required|string|max:15|regex:/^[0-9+()-]+$/',
        ]);

        // Create the counseling request
        Counseling::create([
            'requestBy' => $user->id,
            'issue' => $validated['issue'],
            'noTelephone' => $validated['noTelephone'],
            'status' => 'pending',
        ]);

        return redirect()->route('counseling.index')->with('success', 'Permintaan konseling berhasil dikirim.');
    }

    /**
     * Update the status of a counseling request.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        // Validate the request
        $request->validate([
            'status' => 'required|in:pending,in_progress,completed,canceled',
        ]);

        // Find the counseling request
        $counseling = Counseling::findOrFail($id);

        // Update the status
        $counseling->status = $request->status;
        $counseling->save();

        return redirect()->route('admin.counseling.index')
            ->with('success', 'Status permintaan konseling berhasil diperbarui.');
    }
}