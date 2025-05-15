<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsCategory;
use App\Models\News; // Impor kelas News

class NewsCategoryController extends Controller
{
    public function index()
    {
        $categories = NewsCategory::all();
        return response()->json($categories);
    }

    public function show($news_id)
    {
        $news = News::with('category')->where('news_id', $news_id)->firstOrFail();
        return response()->json($news);
    }
}