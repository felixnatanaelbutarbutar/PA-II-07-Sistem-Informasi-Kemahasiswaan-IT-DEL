<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class HandleInertiaRequests extends Middleware
{
    public function share(Request $request): array
    {
        $user = $request->user();
        $token = null;

        if ($user) {
            // Check for an existing token or create a new one
            $existingToken = $user->tokens()->where('name', 'api')->first();
            if ($existingToken) {
                $token = $existingToken->plainTextToken;
            } else {
                $token = $user->createToken('api')->plainTextToken;
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'nim' => $user->nim,
                    'role' => $user->role,
                    'token' => $token, // Include Sanctum token
                    'asrama' => $user->asrama,
                    'prodi' => $user->prodi,
                    'fakultas' => $user->fakultas,
                    'angkatan' => $user->angkatan,
                    'email' => $user->email,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }
}
