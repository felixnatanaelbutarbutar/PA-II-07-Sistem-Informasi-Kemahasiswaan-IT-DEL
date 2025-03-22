<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Helpers\RoleHelper;
use Symfony\Component\HttpFoundation\Response;

class CheckFeaturePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $feature
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $feature): mixed
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        
        if (!RoleHelper::hasPermission($role, $feature)) {
            return abort(403, 'Anda tidak memiliki akses ke fitur tersebut.');
        }
        
        return $next($request);
    }
} 