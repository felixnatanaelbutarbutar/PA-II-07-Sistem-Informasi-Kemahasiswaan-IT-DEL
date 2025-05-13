<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\ApiProxyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\CarouselController;
use App\Http\Controllers\Api\DirectorController;
use App\Http\Controllers\API\SubmissionController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\NewsCategoryController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\SubmissionResponseController;
use App\Http\Controllers\Api\AnnouncementCategoryController;
use App\Http\Controllers\Api\FormController;

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

// Route untuk Director (Kata Sambutan)
Route::get('/director/active', [DirectorController::class, 'getActiveWelcomeMessage'])->name('api.director.active');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/forms/submissions', [FormController::class, 'store']);
    Route::get('/forms/submissions', [FormController::class, 'index']);
    Route::get('/forms/submissions/{submission_id}', [FormController::class, 'show']);
    Route::put('/forms/submissions/{submission_id}', [FormController::class, 'update']);
    Route::delete('/forms/submissions/{submission_id}', [FormController::class, 'destroy']);
});

// Routes untuk News
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{news_id}', [NewsController::class, 'show']);
Route::get('/news-categories', [NewsCategoryController::class, 'index']);

// Routes untuk Announcement
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::get('/announcements/{announcement_id}', [AnnouncementController::class, 'show']);
Route::get('/announcement-categories', [AnnouncementCategoryController::class, 'index']);

// Route untuk Chatbot
Route::post('/chatbot', [ChatbotController::class, 'chat']);

Route::get('/achievements-grouped', [AchievementController::class, 'getGroupedAchievements']);

Route::get('/carousel/guest', [CarouselController::class, 'guestIndex'])->name('api.carousel.guest.index');

// Route untuk Aspiration Categories (for Dashboard statistics)
Route::get('/aspiration-categories', [DashboardController::class, 'getAspirationCategories'])->name('api.aspiration-categories');

Route::get('/activities', [ActivityController::class, 'index']);
Route::get('/activities/active', [ActivityController::class, 'active']);
Route::get('/activities/nearest', [ActivityController::class, 'nearest']);
// Route::middleware(['debug.sanctum', 'session', 'auth:sanctum'])->group(function () {
//     Route::get('/cis/students', [ApiProxyController::class, 'getStudents'])->name('api.cis.students');
// });
// Route::middleware(['debug.sanctum', 'session'])->group(function () {
//     Route::get('/cis/students', [ApiProxyController::class, 'getStudents'])->name('api.cis.students');
// });

