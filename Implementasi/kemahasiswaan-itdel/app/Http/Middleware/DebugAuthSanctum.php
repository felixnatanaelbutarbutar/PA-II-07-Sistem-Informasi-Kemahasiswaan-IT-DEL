<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

Log::info('DebugAuthSanctum.php File Loaded'); // Log statis

class DebugAuthSanctum
{
    public function __construct()
    {
        Log::info('DebugAuthSanctum Middleware Instantiated');
    }

    public function handle($request, Closure $next)
    {
        $user = Auth::user();
        $userData = null;
        $sessionData = null;

        if ($user) {
            $userData = [
                'id' => $user->id ?? null,
                'username' => $user->username ?? null,
                'email' => $user->email ?? null,
                'role' => $user->role ?? null,
            ];

            Log::info('DebugAuthSanctum User Class:', [
                'class' => get_class($user),
                'implements' => class_implements($user),
            ]);
        }

        try {
            $sessionData = $request->session()->all();
        } catch (\Exception $e) {
            $sessionData = ['error' => 'Session store not set on request'];
        }

        Log::info('DebugAuthSanctum Middleware:', [
            'authenticated' => Auth::check(),
            'user' => $userData,
            'session' => $sessionData,
            'cookies' => $request->cookies->all(),
            'headers' => $request->headers->all(),
        ]);

        return $next($request);
    }
}
