<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper; // Pastikan Anda mengimpor RoleHelper

class ApiProxyController extends Controller
{
    public function showStudents(Request $request)
    {
        $token = $request->session()->get('api_token');
        if (!$token) {
            return redirect()->route('login')->withErrors(['login' => 'Silakan login terlebih dahulu.']);
        }

        try {
            // Ambil data mahasiswa dari CIS API
            $client = new Client();
            $response = $client->get(config('app.cis_api_url') . '/library-api/mahasiswa', [
                'verify' => false,
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Accept' => 'application/json',
                ],
                'query' => [
                    'status' => 'aktif',
                ],
            ]);

            $body = $response->getBody()->getContents();
            $data = json_decode($body, true);

            $studentsData = $data['data']['mahasiswa'] ?? [];
            $students = array_map(function ($mahasiswa) {
                return [
                    'user_id' => $mahasiswa['id'] ?? null,
                    'username' => $mahasiswa['nim'] ?? null,
                    'email' => $mahasiswa['email'] ?? ($mahasiswa['nim'] . '@students.del.ac.id'),
                    'name' => $mahasiswa['nama'] ?? null,
                    'role' => 'Mahasiswa',
                    'status' => $mahasiswa['status'] ?? 1,
                    'nim' => $mahasiswa['nim'] ?? null,
                    'prodi' => $mahasiswa['prodi_name'] ?? null,
                    'fakultas' => $mahasiswa['fakultas'] ?? null,
                    'angkatan' => $mahasiswa['angkatan'] ?? null,
                ];
            }, $studentsData);

            // Ambil parameter pencarian dari request
            $searchQuery = $request->input('search', '');

            // Filter data berdasarkan NIM, nama, atau prodi
            if ($searchQuery) {
                $students = array_filter($students, function ($student) use ($searchQuery) {
                    $searchLower = strtolower($searchQuery);
                    return (
                        stripos(strtolower($student['nim']), $searchLower) !== false ||
                        stripos(strtolower($student['name']), $searchLower) !== false ||
                        stripos(strtolower($student['prodi'] ?? ''), $searchLower) !== false
                    );
                });
                $students = array_values($students); // Reset indeks array setelah filter
            }

            // Pagination: Batasi menjadi 10 mahasiswa per halaman
            $perPage = 10;
            $currentPage = $request->input('page', 1);
            $offset = ($currentPage - 1) * $perPage;
            $total = count($students);
            $studentsPaginated = array_slice($students, $offset, $perPage);

            // Ambil data existingAdmins dari tabel users untuk mengecek role dan status
            $existingAdmins = User::whereIn('nim', array_column($students, 'nim'))
                ->get()
                ->keyBy('nim')
                ->map(function ($user) {
                    return [
                        'role' => $user->role,
                        'status' => $user->status === 1 ? 'active' : 'inactive',
                    ];
                })
                ->toArray();

            // Ambil data pengguna yang sedang login
            $user = Auth::user();
            $role = strtolower($user->role);

            // Ambil menu navigasi dan permissions menggunakan RoleHelper
            $menuItems = RoleHelper::getNavigationMenu($role);
            $permissions = RoleHelper::getRolePermissions($role);

            // Kembalikan data menggunakan Inertia untuk merender komponen React
            return Inertia::render('Admin/OrganizationAdmin/index', [
                'students' => [
                    'data' => $studentsPaginated,
                    'current_page' => $currentPage,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => ceil($total / $perPage),
                ],
                'existingAdmins' => $existingAdmins,
                'searchQuery' => $searchQuery,
                'auth' => ['user' => $user], // Kirim data pengguna
                'userRole' => $role, // Kirim role pengguna
                'permissions' => $permissions, // Kirim permissions
                'navigation' => $menuItems, // Kirim menu navigasi
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching students: ' . $e->getMessage());

            // Ambil data pengguna yang sedang login untuk error state
            $user = Auth::user();
            $role = $user ? strtolower($user->role) : null;
            $menuItems = $role ? RoleHelper::getNavigationMenu($role) : [];
            $permissions = $role ? RoleHelper::getRolePermissions($role) : [];

            return Inertia::render('Admin/OrganizationAdmin/index', [
                'error' => 'Gagal mengambil data mahasiswa: ' . $e->getMessage(),
                'students' => [
                    'data' => [],
                    'current_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                    'last_page' => 1,
                ],
                'existingAdmins' => [],
                'searchQuery' => '',
                'auth' => ['user' => $user],
                'userRole' => $role,
                'permissions' => $permissions,
                'navigation' => $menuItems,
            ]);
        }
    }
}