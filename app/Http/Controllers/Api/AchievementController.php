<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function index()
    {
        $achievements = Achievement::orderBy('created_at', 'desc')->get();
        return response()->json($achievements);
    }

    public function show($achievement_id)
    {
        $achievement = Achievement::findOrFail($achievement_id);
        return response()->json($achievement);
    }
}