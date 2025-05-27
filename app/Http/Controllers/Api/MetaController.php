<?php

namespace App\Http\Controllers\Api;

use App\Models\Meta;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MetaController extends Controller
{
    public function getByKey($key)
    {
        $meta = Meta::where('meta_key', $key)
                    ->where('is_active', true)
                    ->first();

        if (!$meta) {
            return response()->json(['message' => 'Meta not found or not active'], 404);
        }

        return response()->json($meta);
    }
}