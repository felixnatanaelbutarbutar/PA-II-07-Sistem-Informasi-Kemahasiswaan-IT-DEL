<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;
use Illuminate\Support\Facades\Log;

class VerifyCsrfToken extends Middleware
{
    protected $except = [];

    protected function tokensMatch($request)
    {
        $tokenMatch = parent::tokensMatch($request);
        if (!$tokenMatch) {
            Log::warning('CSRF token mismatch', [
                'request_token' => $request->header('X-CSRF-TOKEN') ?: $request->input('_token'),
                'session_token' => $request->session()->token(),
            ]);
        }
        return $tokenMatch;
    }
}