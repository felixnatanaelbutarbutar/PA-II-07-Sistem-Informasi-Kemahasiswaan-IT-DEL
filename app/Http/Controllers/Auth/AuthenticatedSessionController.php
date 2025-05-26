<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class AuthenticatedSessionController extends Controller
{
    public function __construct()
    {
        $this->middleware('web')->only(['create', 'store']);
    }

    public function store(Request $request)
    {
        Log::info('Middleware applied:', [
            'middleware' => $request->route()->middleware(),
        ]);

        // Validasi input
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        Log::info('Login Attempt:', ['username' => $request->username]);

        try {
            // Buat instance Guzzle Client
            $client = new Client();

            // Log nilai CIS_API_URL dari konfigurasi
            $cisApiUrl = config('app.cis_api_url');
            Log::info('CIS_API_URL from config:', ['cis_api_url' => $cisApiUrl]);

            // Pastikan CIS_API_URL tidak kosong
            if (empty($cisApiUrl)) {
                Log::error('CIS_API_URL is empty or not set in configuration');
                return back()
                    ->withErrors(['username' => 'Konfigurasi server autentikasi tidak valid. Hubungi administrator.'])
                    ->with('status', 'Konfigurasi server autentikasi tidak valid. Hubungi administrator.');
            }

            // Log URL yang digunakan untuk login
            $apiUrl = $cisApiUrl . '/jwt-api/do-auth';
            Log::info('API URL for login:', ['url' => $apiUrl]);

            // Kirim request ke API CIS untuk login
            $response = $client->post($apiUrl, [
                'verify' => false,
                'form_params' => [
                    'username' => $request->username,
                    'password' => $request->password,
                ],
            ]);

            // Decode respons API
            $data = json_decode($response->getBody()->getContents(), true);
            Log::info('API Response from /jwt-api/do-auth:', $data);

            // Periksa apakah login berhasil
            if (!isset($data['result']) || $data['result'] !== true || !isset($data['token']) || !isset($data['user'])) {
                Log::error('Login Failed: Invalid API response structure');
                $errorMessage = $data['error'] ?? 'Login gagal: username atau password salah.';
                return back()
                    ->withErrors(['username' => $errorMessage])
                    ->with('status', $errorMessage);
            }

            // Ambil token dan data pengguna
            $token = $data['token'];
            $apiUser = $data['user'];

            // Petakan role dari API ke role sistem Anda
            $roleMapping = [
                'dosen' => 'kemahasiswaan',
                'staff' => 'kemahasiswaan',
                'mahasiswa' => 'mahasiswa',
                'lppm' => 'kemahasiswaan',
                'wr1' => 'kemahasiswaan',
                'wr2' => 'kemahasiswaan',
                'wr3' => 'kemahasiswaan',
                'kaprodi' => 'kemahasiswaan',
                'logistik' => 'kemahasiswaan',
                'koordinator' => 'kemahasiswaan',
                'authenticated user' => 'kemahasiswaan',
                'staf administrasi akademik dan kemahasiswaan' => 'kemahasiswaan',
                'adminbem' => 'adminbem',
                'adminmpm' => 'adminmpm',
            ];

            // Tentukan role pengguna dari API
            $apiRole = strtolower($apiUser['role'] ?? 'unknown');
            Log::info('API Role:', ['role' => $apiRole]);
            $defaultUserRole = $roleMapping[$apiRole] ?? null;
            Log::info('Mapped Role (default):', ['defaultUserRole' => $defaultUserRole]);

            // Jika role tidak dikenali, tolak login
            if (!$defaultUserRole || !in_array($defaultUserRole, ['superadmin', 'kemahasiswaan', 'adminbem', 'adminmpm', 'mahasiswa'])) {
                Log::error('Login Failed: Unrecognized role', ['apiRole' => $apiRole, 'defaultUserRole' => $defaultUserRole]);
                return back()
                    ->withErrors(['username' => 'Role tidak dikenali. Hubungi administrator.'])
                    ->with('status', 'Role tidak dikenali. Hubungi administrator.');
            }

            // Inisialisasi data pengguna tanpa 'role' terlebih dahulu
            $userData = [
                'username' => $apiUser['username'],
                'email' => $apiUser['email'] ?? ($apiUser['username'] . '@del.ac.id'),
                'password' => bcrypt($request->password),
            ];

            // Jika role adalah 'mahasiswa', ambil data tambahan dari /library-api/mahasiswa
            if ($defaultUserRole === 'mahasiswa') {
                $mahasiswaApiUrl = $cisApiUrl . '/library-api/mahasiswa';
                Log::info('Fetching mahasiswa data from:', ['url' => $mahasiswaApiUrl]);

                $mahasiswaResponse = $client->get($mahasiswaApiUrl, [
                    'verify' => false,
                    'headers' => [
                        'Authorization' => 'Bearer ' . $token,
                        'Accept' => 'application/json',
                    ],
                    'query' => [
                        'username' => $apiUser['username'],
                        'status' => 'aktif',
                    ],
                ]);

                $mahasiswaData = json_decode($mahasiswaResponse->getBody()->getContents(), true);
                Log::info('Mahasiswa API Response:', $mahasiswaData);

                // Pastikan data mahasiswa ditemukan
                if (!empty($mahasiswaData) && isset($mahasiswaData['data']['mahasiswa']) && is_array($mahasiswaData['data']['mahasiswa']) && !empty($mahasiswaData['data']['mahasiswa'])) {
                    $mahasiswa = $mahasiswaData['data']['mahasiswa'][0];
                    // Gabungkan data mahasiswa ke $apiUser
                    $apiUser = array_merge($apiUser, $mahasiswa);

                    // Isi data mahasiswa ke $userData
                    $userData['nim'] = $mahasiswa['nim'] ?? null;
                    $userData['asrama'] = !empty($mahasiswa['asrama']) ? $mahasiswa['asrama'] : null;
                    $userData['prodi'] = $mahasiswa['prodi_name'] ?? null;
                    $userData['fakultas'] = $mahasiswa['fakultas'] ?? null;
                    $userData['angkatan'] = $mahasiswa['angkatan'] ?? null;
                } else {
                    Log::warning('No mahasiswa data found for user:', ['username' => $apiUser['username']]);
                }
            }

            // Isi kolom 'name' setelah data mahasiswa digabungkan
            $userData['name'] = $apiUser['nama'] ?? $apiUser['name'] ?? $apiUser['username'];

            // Cari pengguna di database lokal berdasarkan username
            $existingUser = User::where('username', $apiUser['username'])->first();

            if ($existingUser) {
                // Jika pengguna sudah ada, gunakan role yang ada di tabel users
                $userRole = $existingUser->role;
                Log::info('User exists, using role from database:', ['username' => $existingUser->username, 'role' => $userRole]);

                // Update data pengguna, kecuali role
                $existingUser->update([
                    'email' => $userData['email'],
                    'name' => $userData['name'],
                    'password' => $userData['password'],
                    'nim' => $userData['nim'] ?? $existingUser->nim,
                    'asrama' => $userData['asrama'] ?? $existingUser->asrama,
                    'prodi' => $userData['prodi'] ?? $existingUser->prodi,
                    'fakultas' => $userData['fakultas'] ?? $existingUser->fakultas,
                    'angkatan' => $userData['angkatan'] ?? $existingUser->angkatan,
                ]);

                $user = $existingUser;
            } else {
                // Jika pengguna belum ada, gunakan role dari API (default role)
                $userRole = $defaultUserRole;
                Log::info('User does not exist, creating new user with role from API:', ['username' => $apiUser['username'], 'role' => $userRole]);

                // Tambahkan role ke $userData untuk pembuatan user baru
                $userData['role'] = $userRole;

                // Buat pengguna baru
                $user = User::create($userData);
            }

            Log::info('User Data After Processing:', ['user' => $user->toArray()]);

            // Periksa status user
            if ($user->status === 'inactive') {
                Log::warning('Login Failed: User is inactive', ['username' => $user->username]);
                return back()
                    ->withErrors(['username' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.'])
                    ->with('status', 'Akun Anda telah dinonaktifkan. Hubungi administrator.');
            }

            // Simpan data API ke session untuk digunakan di halaman lain
            $request->session()->put('api_user', $apiUser);
            Log::info('API User Data Stored in Session:', ['api_user' => $apiUser]);

            // Login pengguna ke session Laravel
            Auth::login($user, $request->filled('remember'));
            Log::info('User Logged In:', [
                'user_id' => $user->id,
                'session_id' => $request->session()->getId(),
                'session_data' => $request->session()->all(),
            ]);

            // Simpan token ke session untuk digunakan di request API berikutnya
            $request->session()->put('api_token', $token);
            Log::info('API Token Stored in Session:', [
                'token' => $token,
                'session_id' => $request->session()->getId(),
                'session_data' => $request->session()->all(),
            ]);

            // Ambil intended URL sebelum regenerasi session
            $intendedUrl = $request->session()->get('url.intended', null);
            Log::info('Intended URL Before Regeneration:', ['url' => $intendedUrl]);

            // Regenerate session
            $request->session()->regenerate();
            Log::info('Session Regenerated:', [
                'new_session_id' => $request->session()->getId(),
                'session_data' => $request->session()->all(),
                'queued_cookies' => app('cookie')->getQueuedCookies(),
            ]);

            // Tentukan redirect berdasarkan role
            $defaultRedirectRoute = match ($user->role) {
                'superadmin' => route('superadmin.dashboard'),
                'kemahasiswaan', 'adminbem', 'adminmpm' => route('admin.dashboard'),
                'mahasiswa' => route('counseling.index'),
                default => '/',
            };

            Log::info('Default Redirect Route:', ['route' => $defaultRedirectRoute]);

            // Jika request adalah AJAX, kembalikan JSON
            if ($request->wantsJson()) {
                $response = response()->json([
                    'status' => 'success',
                    'username' => $user->username,
                    'role' => $user->role,
                    'redirect' => $intendedUrl ?? $defaultRedirectRoute,
                ]);

                Log::info('AJAX Login Response:', [
                    'status' => 'success',
                    'username' => $user->username,
                    'role' => $user->role,
                    'redirect' => $intendedUrl ?? $defaultRedirectRoute,
                    'headers' => $response->headers->all(),
                    'cookies' => $response->headers->getCookies(),
                ]);

                return $response;
            }

            // Redirect ke intended URL jika ada, jika tidak gunakan default route
            $redirectUrl = $intendedUrl ?? $defaultRedirectRoute;
            Log::info('Final Redirect URL:', ['url' => $redirectUrl]);

            $redirectResponse = redirect($redirectUrl)
                ->withCookie(cookie('laravel_session', $request->session()->getId(), 120));
            Log::info('Redirect Response Headers:', [
                'headers' => $redirectResponse->headers->all(),
                'cookies' => $redirectResponse->headers->getCookies(),
            ]);

            return $redirectResponse;
        } catch (RequestException $e) {
            // Tangani error dari API
            $errorMessage = 'Terjadi kesalahan saat menghubungi server autentikasi.';
            if ($e->hasResponse()) {
                $errorData = json_decode($e->getResponse()->getBody()->getContents(), true);
                $errorMessage = $errorData['message'] ?? $errorData['error'] ?? $errorMessage;
            }
            Log::error('API Request Failed:', ['error' => $e->getMessage(), 'response' => $errorData ?? null]);
            return back()
                ->withErrors(['username' => $errorMessage])
                ->with('status', $errorMessage);
        } catch (\Exception $e) {
            // Tangani error lainnya
            Log::error('Login Failed:', ['error' => $e->getMessage()]);
            $errorMessage = 'Terjadi kesalahan: ' . $e->getMessage();
            return back()
                ->withErrors(['username' => $errorMessage])
                ->with('status', $errorMessage);
        }
    }

    public function destroy(Request $request): RedirectResponse
    {
        // Hapus token dan data API dari session
        $request->session()->forget(['api_token', 'api_user']);
        Log::info('Session Data Cleared Before Logout:', [
            'session_data' => $request->session()->all(),
        ]);

        Auth::guard('web')->logout();
        Log::info('User Logged Out:', [
            'user_id' => Auth::id(),
        ]);

        $request->session()->invalidate();
        Log::info('Session Invalidated:', [
            'session_id' => $request->session()->getId(),
        ]);

        $request->session()->regenerateToken();
        Log::info('CSRF Token Regenerated:', [
            'new_token' => $request->session()->token(),
        ]);

        return redirect('/');
    }
}