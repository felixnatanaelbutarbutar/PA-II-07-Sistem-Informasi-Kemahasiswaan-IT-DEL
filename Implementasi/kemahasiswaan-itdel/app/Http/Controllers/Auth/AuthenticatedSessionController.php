<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

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
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return back()->withErrors(['email' => 'Login gagal: email atau password salah.']);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        // Debugging untuk memastikan role terbaca dengan benar
        if (!$user || !$user->role) {
            Auth::logout();
            return back()->withErrors(['email' => 'Gagal mendapatkan role user, cek database atau konfigurasi model.']);
        }

        // Pastikan role yang didapat sesuai
        if (!in_array($user->role, ['superadmin', 'kemahasiswaan', 'adminbem', 'adminmpm', 'mahasiswa'])) {
            Auth::logout();
            return back()->withErrors(['email' => 'Role tidak dikenali. Hubungi administrator.']);
        }

        // Determine the default redirect route based on role
        $defaultRedirectRoute = match ($user->role) {
            'superadmin' => route('superadmin.dashboard'),
            'kemahasiswaan', 'adminbem', 'adminmpm' => route('admin.dashboard'),
            'mahasiswa' => '/', // Redirect mahasiswa to homepage if no intended URL
            default => '/',
        };

        // Check if there's an intended URL (e.g., user was redirected to login from /counseling)
        $intendedUrl = $request->session()->pull('url.intended', $defaultRedirectRoute);

        // If request is AJAX (e.g., from Inertia), return JSON response
        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'email' => $user->email,
                'role' => $user->role,
                'redirect' => $intendedUrl,
            ]);
        }

        // Redirect to the intended URL or the default route
        return redirect()->intended($defaultRedirectRoute);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}