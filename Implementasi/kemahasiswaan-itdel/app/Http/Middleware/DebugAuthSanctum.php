<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DebugAuthSanctum
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        $userData = $user ? [
            'id' => $user->id,
            'username' => $user->username ?? null,
            'email' => $user->email ?? null,
            'role' => $user->role ?? null,
            'class' => get_class($user),
            'implements' => class_implements($user),
        ] : null;

        $sessionData = null;
        if ($request->hasSession()) {
            try {
                $sessionData = $request->session()->all();
            } catch (\Exception $e) {
                $sessionData = ['error' => 'Failed to access session: ' . $e->getMessage()];
            }
        } else {
            $sessionData = ['error' => 'No session store set on request'];
        }

        Log::debug('DebugAuthSanctum Middleware:', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'authenticated' => Auth::check(),
            'user' => $userData,
            'session' => $sessionData,
            'cookies' => $request->cookies->all(),
            'headers' => $request->headers->all(),
        ]);

        return $next($request);
    }
}
