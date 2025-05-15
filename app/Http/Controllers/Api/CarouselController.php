<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carousel;
use Illuminate\Support\Facades\Cache;

class CarouselController extends Controller
{
    /**
     * Display active carousels for guest users (Home page) via API.
     */
    public function guestIndex()
    {
        $carousels = Cache::remember('carousels', 60 * 60, function () {
            return Carousel::where('is_active', true)
                ->orderBy('order')
                ->select('carousel_id', 'image_path', 'order')
                ->get();
        });

        return response()->json($carousels);
    }
}