<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, ...$guards)
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();

                // Redirect pengguna yang sudah login
                return match ($user->role ?? 'default') {
                    // 'superadmin' => redirect()->route('superadmin.dashboard'),
                    'kemahasiswaan', 'adminbem', 'adminmpm' => redirect()->route('admin.dashboard'),
                    'mahasiswa' => $this->redirectMahasiswa($request),
                    default => redirect('/'),
                };
            }
        }

        return $next($request);
    }

    /**
     * Redirect mahasiswa ke halaman terakhir yang diakses atau halaman default.
     */
    protected function redirectMahasiswa(Request $request)
    {
        // Cek apakah ada URL yang tersimpan di session
        if ($request->session()->has('url.intended')) {
            $intendedUrl = $request->session()->get('url.intended');
            // Hapus URL dari session setelah digunakan
            $request->session()->forget('url.intended');
            return redirect($intendedUrl);
        }

        // Jika tidak ada URL yang tersimpan, arahkan ke halaman default (misalnya, counseling)
        return redirect()->route('counseling.index'); // Ganti dengan rute yang sesuai
    }
}