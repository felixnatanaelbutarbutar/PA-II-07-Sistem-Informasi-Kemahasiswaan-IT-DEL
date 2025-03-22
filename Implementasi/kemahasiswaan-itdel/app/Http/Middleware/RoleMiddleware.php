<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        $allowedRoles = array_map('trim', explode(',', strtolower($roles)));
        $userRole = strtolower($user->role);

        // Log request details for debugging
        Log::debug('Role check', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_role' => $userRole,
            'allowed_roles' => $allowedRoles,
            'request_path' => $request->path()
        ]);

        // Jika user memiliki role yang sesuai, lanjutkan request
        if (in_array($userRole, $allowedRoles)) {
            return $next($request);
        }

        // Log unauthorized access attempts
        Log::warning('Unauthorized access attempt', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_role' => $userRole,
            'required_roles' => $allowedRoles,
            'request_path' => $request->path()
        ]);

        // Jika user sudah di halaman dashboardnya, jangan redirect
        if ($request->routeIs('admin.dashboard') && in_array($userRole, ['kemahasiswaan', 'adminbem', 'adminmpm'])) {
            return $next($request);
        }
        if ($request->routeIs('superadmin.dashboard') && $userRole === 'superadmin') {
            return $next($request);
        }
        if ($request->routeIs('mahasiswa.dashboard') && $userRole === 'mahasiswa') {
            return $next($request);
        }

        // Redirect ke halaman sesuai role, tapi pastikan tidak ke halaman yang sama
        return redirect()->route(match ($userRole) {
            'superadmin' => 'superadmin.dashboard',
            'kemahasiswaan', 'adminbem', 'adminmpm' => 'admin.dashboard',
            'mahasiswa' => 'mahasiswa.dashboard',
            default => 'login',
        });
    }
}
