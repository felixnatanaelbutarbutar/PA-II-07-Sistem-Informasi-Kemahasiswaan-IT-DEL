<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\NewsCategoryController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AnnouncementCategoryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Routes untuk News
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{news_id}', [NewsController::class, 'show']);
Route::get('/news-categories', [NewsCategoryController::class, 'index']);

// Routes untuk Announcement
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::get('/announcements/{announcement_id}', [AnnouncementController::class, 'show']);
Route::get('/announcement-categories', [AnnouncementCategoryController::class, 'index']);