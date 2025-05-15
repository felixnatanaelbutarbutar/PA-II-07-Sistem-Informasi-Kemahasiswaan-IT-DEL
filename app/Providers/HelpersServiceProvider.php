<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class HelpersServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // No direct file loading or facade usage
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
} 