<?php

namespace App\Http\Controllers\Api;

use App\Models\Meta;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MetaController extends Controller
{
    public function getByKey($key)
    {
        $meta = Meta::where('meta_key', $key)->first();

        if (!$meta) {
            return response()->json(['message' => 'Meta not found'], 404);
        }

        return response()->json($meta);
    }
}