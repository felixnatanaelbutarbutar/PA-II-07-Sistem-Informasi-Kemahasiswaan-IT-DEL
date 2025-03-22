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

            if ($request->routeIs('login')) { // Hanya redirect jika di halaman login
                return match ($user->role) {
                    'superadmin' => redirect()->route('superadmin.dashboard'),
                    'kemahasiswaan', 'adminbem', 'adminmpm' => redirect()->route('admin.dashboard'),
                    'mahasiswa' => redirect()->route('mahasiswa.dashboard'),
                    default => redirect('/'),
                };
            }
        }
    }

    return $next($request);
}

}
