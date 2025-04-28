<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth; // Import the Auth facade

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        // Set the application timezone to Asia/Jakarta (WIB)
        date_default_timezone_set('Asia/Jakarta');

        // Share the CIS API URL with Inertia
        Inertia::share('cisApiUrl', function () {
            return config('app.cis_api_url');
        });

        // Share the CSRF token with Inertia
        Inertia::share('csrf_token', function () {
            return Session::token();
        });

        // Share authenticated user data (optional)
        Inertia::share('auth', function () {
            if (Auth::check()) { // Use Auth::check() instead of auth()->check()
                return [
                    'user' => Auth::user(), // Use Auth::user() instead of auth()->user()
                    'role' => strtolower(Auth::user()->role),
                ];
            }
            return null;
        });
    }
}