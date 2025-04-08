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
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        Log::info('Login Attempt:', ['username' => $request->username]);

        // Cek apakah user ada di database lokal dan memiliki role adminmpm atau adminbem
        $user = User::where('username', $request->username)->first();

        if ($user && in_array($user->role, ['adminmpm', 'adminbem']) && Hash::check($request->password, $user->password)) {
            // Autentikasi lokal untuk adminmpm dan adminbem
            Log::info('Local Authentication Successful:', ['username' => $user->username, 'role' => $user->role]);

            // Login pengguna ke session Laravel
            Auth::login($user, $request->filled('remember'));
            Log::info('User Logged In:', ['user_id' => $user->id]);

            // Regenerate session
            $request->session()->regenerate();

            // Tentukan redirect berdasarkan role
            $defaultRedirectRoute = match ($user->role) {
                'superadmin' => route('superadmin.dashboard'),
                'kemahasiswaan', 'adminbem', 'adminmpm' => route('admin.dashboard'),
                'mahasiswa' => route('counseling.index'),
                default => '/',
            };

            Log::info('Redirect Route:', ['route' => $defaultRedirectRoute]);

            // Check if there's an intended URL
            $intendedUrl = $request->session()->pull('url.intended', $defaultRedirectRoute);
            Log::info('Intended URL:', ['url' => $intendedUrl]);

            // Jika request adalah AJAX, kembalikan JSON
            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'username' => $user->username,
                    'role' => $user->role,
                    'redirect' => $intendedUrl,
                ]);
            }

            // Redirect ke intended URL atau default route
            return redirect()->intended($defaultRedirectRoute);
        }

        // Jika bukan adminmpm atau adminbem, lanjutkan autentikasi via API
        try {
            // Buat instance Guzzle Client
            $client = new Client();

            // Log nilai CIS_API_URL dari konfigurasi
            $cisApiUrl = config('app.cis_api_url');
            Log::info('CIS_API_URL from config:', ['cis_api_url' => $cisApiUrl]);

            // Pastikan CIS_API_URL tidak kosong
            if (empty($cisApiUrl)) {
                Log::error('CIS_API_URL is empty or not set in configuration');
                return back()->withErrors(['username' => 'Konfigurasi server autentikasi tidak valid. Hubungi administrator.']);
            }

            // Log URL yang digunakan untuk login
            $apiUrl = $cisApiUrl . '/jwt-api/do-auth';
            Log::info('API URL for login:', ['url' => $apiUrl]);

            // Kirim request ke API CIS untuk login
            $response = $client->post($apiUrl, [
                'verify' => false, // Nonaktifkan verifikasi SSL
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
                return back()->withErrors(['username' => $errorMessage]);
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
            ];

            // Tentukan role pengguna
            $apiRole = strtolower($apiUser['role'] ?? 'unknown');
            Log::info('API Role:', ['role' => $apiRole]);
            $userRole = $roleMapping[$apiRole] ?? null;
            Log::info('Mapped Role:', ['userRole' => $userRole]);

            // Jika role tidak dikenali, tolak login
            if (!$userRole || !in_array($userRole, ['superadmin', 'kemahasiswaan', 'adminbem', 'adminmpm', 'mahasiswa'])) {
                Log::error('Login Failed: Unrecognized role', ['apiRole' => $apiRole, 'userRole' => $userRole]);
                return back()->withErrors(['username' => 'Role tidak dikenali. Hubungi administrator.']);
            }

            // Inisialisasi data pengguna tanpa 'name' terlebih dahulu
            $userData = [
                'username' => $apiUser['username'],
                'email' => $apiUser['email'] ?? ($apiUser['username'] . '@del.ac.id'),
                'password' => bcrypt($request->password),
                'role' => $userRole,
            ];

            // Jika role adalah 'mahasiswa', ambil data tambahan dari /library-api/mahasiswa
            if ($userRole === 'mahasiswa') {
                $mahasiswaApiUrl = $cisApiUrl . '/library-api/mahasiswa';
                Log::info('Fetching mahasiswa data from:', ['url' => $mahasiswaApiUrl]);

                $mahasiswaResponse = $client->get($mahasiswaApiUrl, [
                    'verify' => false, // Nonaktifkan verifikasi SSL
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

            Log::info('Data for updateOrCreate:', $userData);

            // Cari atau buat pengguna di database lokal
            $user = User::updateOrCreate(
                ['username' => $apiUser['username']],
                $userData
            );

            Log::info('User Created/Updated:', ['user' => $user->toArray()]);

            // Simpan data API ke session untuk digunakan di halaman lain
            $request->session()->put('api_user', $apiUser);
            Log::info('API User Data Stored in Session:', ['api_user' => $apiUser]);

            // Login pengguna ke session Laravel
            Auth::login($user, $request->filled('remember'));
            Log::info('User Logged In:', ['user_id' => $user->id]);

            // Simpan token ke session untuk digunakan di request API berikutnya
            $request->session()->put('api_token', $token);
            Log::info('API Token Stored in Session');

            // Regenerate session
            $request->session()->regenerate();

            // Tentukan redirect berdasarkan role
            $defaultRedirectRoute = match ($user->role) {
                'superadmin' => route('superadmin.dashboard'),
                'kemahasiswaan', 'adminbem', 'adminmpm' => route('admin.dashboard'),
                'mahasiswa' => route('counseling.index'),
                default => '/',
            };

            Log::info('Redirect Route:', ['route' => $defaultRedirectRoute]);

            // Check if there's an intended URL
            $intendedUrl = $request->session()->pull('url.intended', $defaultRedirectRoute);
            Log::info('Intended URL:', ['url' => $intendedUrl]);

            // Jika request adalah AJAX, kembalikan JSON
            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'username' => $user->username,
                    'role' => $user->role,
                    'redirect' => $intendedUrl,
                ]);
            }

            // Redirect ke intended URL atau default route
            return redirect()->intended($defaultRedirectRoute);

        } catch (RequestException $e) {
            // Tangani error dari API
            $errorMessage = 'Terjadi kesalahan saat menghubungi server autentikasi.';
            if ($e->hasResponse()) {
                $errorData = json_decode($e->getResponse()->getBody()->getContents(), true);
                $errorMessage = $errorData['message'] ?? $errorData['error'] ?? $errorMessage;
            }
            Log::error('API Request Failed:', ['error' => $e->getMessage(), 'response' => $errorData ?? null]);
            return back()->withErrors(['username' => $errorMessage]);
        } catch (\Exception $e) {
            // Tangani error lainnya
            Log::error('Login Failed:', ['error' => $e->getMessage()]);
            return back()->withErrors(['username' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Hapus token dan data API dari session
        $request->session()->forget(['api_token', 'api_user']);

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}