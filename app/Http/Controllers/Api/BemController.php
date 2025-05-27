<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BEM;
use Illuminate\Support\Facades\Cache;

class BemController extends Controller
{
    /**
     * Display active BEM data for guest users via API.
     */
    public function show()
    {
        $bem = Cache::remember('bem', 60 * 60, function () {
            return BEM::where('is_active', true)
                ->select('id', 'logo', 'introduction', 'vision', 'mission', 'structure', 'work_programs', 'recruitment_status')
                ->first();
        });

        if (!$bem) {
            return response()->json(['error' => 'Data BEM tidak ditemukan'], 404);
        }

        return response()->json($bem);
    }
}