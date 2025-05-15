<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnnouncementCategory;

class AnnouncementCategoryController extends Controller
{
    public function index()
    {
        $categories = AnnouncementCategory::all();
        return response()->json($categories);
    }
}