<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RedirectIfAuthenticated
{
    public function __construct()
    {
        Log::info('RedirectIfAuthenticated middleware instantiated');
    }

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

    protected function redirectMahasiswa(Request $request)
    {
        if ($request->session()->has('url.intended')) {
            $intendedUrl = $request->session()->get('url.intended');
            $request->session()->forget('url.intended');
            return redirect($intendedUrl);
        }

        return redirect()->route('counseling.index');
    }
}