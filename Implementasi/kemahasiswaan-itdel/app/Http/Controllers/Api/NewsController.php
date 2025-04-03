<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    /**
     * Get a list of news items
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10); // Ambil parameter per_page, default 10
        $news = News::with('category')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage); // Gunakan paginate alih-alih get
        return response()->json($news);
    }

    /**
     * Get a single news item by ID
     */
    public function show($news_id)
    {
        $news = News::with('category')->findOrFail($news_id);
        return response()->json($news);
    }
}