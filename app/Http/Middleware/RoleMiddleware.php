<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = Auth::user();

        // Debugging
        Log::debug('Role check', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'user_role' => $user?->role,
            'allowed_roles' => $roles,
            'request_path' => $request->path()
        ]);

        // Pastikan role user ada di daftar roles yang diperbolehkan
        if (!$user || !in_array($user->role, $roles)) {
            Log::warning('Unauthorized access attempt', [
                'user_id' => $user?->id,
                'user_email' => $user?->email,
                'user_role' => $user?->role,
                'required_roles' => $roles,
                'request_path' => $request->path()
            ]);
            abort(403, 'Anda tidak memiliki akses di halaman ini');
        }

        return $next($request);
    }
}
