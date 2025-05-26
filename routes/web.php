<?php

use App\Models\User;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BemController;
use App\Http\Controllers\MpmController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\MetaController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ApiProxyController;
use App\Http\Controllers\CarouselController;
use App\Http\Controllers\DirectorController;
use App\Http\Controllers\DownloadController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AspirationController;
use App\Http\Controllers\CounselingController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\ChatbotRuleController;
use App\Http\Controllers\ScholarshipController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\FormSettingsController;
use App\Http\Controllers\NewsCategoryController;
use App\Http\Controllers\AchievementTypeController;
use App\Http\Controllers\DownloadCategoryController;
use App\Http\Controllers\OrganizationAdminController;
use App\Http\Controllers\AspirationCategoryController;
use App\Http\Controllers\ScholarshipCategoryController;
use App\Http\Controllers\AnnouncementCategoryController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// Public Routes (Accessible to Guests)
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/newsguest', function () {
    return Inertia::render('News');
})->name('news.guest.index');

Route::get('/news/{news_id}', [NewsController::class, 'show'])->name('news.show');

Route::get('/announcement', function () {
    return Inertia::render('Announcement');
})->name('announcement.guest.index');

Route::get('/announcement/{announcement_id}', [AnnouncementController::class, 'show'])->name('announcement.show');

// Counseling Routes (Accessible to Guests and Mahasiswa)
Route::get('/counseling', [CounselingController::class, 'index'])->name('counseling.index');
Route::post('/counseling', [CounselingController::class, 'store'])
    ->middleware(['auth', 'role:mahasiswa'])
    ->name('counseling.store');

// Activity Calendar for Guests
Route::get('/activities', [ActivityController::class, 'guestIndex'])->name('activities.guest.index');
Route::get('/activities/export/pdf', [ActivityController::class, 'guestExportToPDF'])->name('activities.guest.export.pdf');

// Achievements Routes
Route::get('/achievements', [AchievementController::class, 'guestIndex'])->name('achievements.index');
Route::get('/achievements/{achievement_id}', [AchievementController::class, 'show'])->name('achievements.show');

// Chatbot Route
Route::get('/chatbot', function () {
    return Inertia::render('Chatbot');
})->name('chatbot.index');

// Aspiration Routes for Guests/Mahasiswa
Route::get('/aspiration', [AspirationController::class, 'index'])->name('aspiration.index');
Route::post('/aspiration', [AspirationController::class, 'store'])->name('aspiration.store');

// BEM and MPM Routes for Guests
Route::get('/bem', [BemController::class, 'show'])->name('bem.show');
Route::get('/mpm', [MpmController::class, 'show'])->name('mpm.show');

// Download Routes for Guests
Route::get('/downloads', [DownloadController::class, 'guestIndex'])->name('downloads.guest.index');

// Scholarship and Form Routes for Guests/Mahasiswa
Route::get('/scholarships', [ScholarshipController::class, 'guestIndex'])->name('scholarships.index');
Route::get('/scholarships/{scholarship_id}', [ScholarshipController::class, 'guestShow'])->name('scholarships.show');
Route::get('/scholarships/form/{form_id}', [FormController::class, 'showForm'])->name('scholarships.form.show');
Route::post('/forms/submit', [FormController::class, 'storeSubmission'])
    ->middleware(['auth', 'role:mahasiswa'])
    ->name('forms.submit');

// Login Route
Route::get('/login', function () {
    if (Auth::check()) {
        $user = Auth::user();
        $role = strtolower($user->role);
        $intendedUrl = session('url.intended', route('scholarships.index'));

        // Prevent redirect loop
        if (str_contains($intendedUrl, '/login')) {
            $intendedUrl = route('scholarships.index');
        }

        Log::info('Authenticated user redirect', [
            'user_id' => $user->id,
            'role' => $role,
            'intended_url' => $intendedUrl,
        ]);

        // Biarkan AuthenticatedSessionController menangani redirect setelah login
        return redirect($intendedUrl);
    }

    // Store intended URL if provided
    $intendedUrl = request()->query('intended') ? urldecode(request()->query('intended')) : null;
    if ($intendedUrl) {
        session(['url.intended' => $intendedUrl]);
        Log::info('Set intended URL', ['intended' => $intendedUrl]);
    }

    return Inertia::render('Auth/Login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
        'intended' => $intendedUrl,
    ]);
})->middleware('guest')->name('login');

// Login POST Route
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.post');

// Logout Route
Route::post('/logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect()->route('scholarships.index');
})->name('logout');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    // Admin Routes (Kemahasiswaan, AdminBEM, AdminMPM)
    Route::prefix('admin')->name('admin.')->middleware(['role:kemahasiswaan,adminbem,adminmpm'])->group(function () {
        // Dashboard Routes
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/activities/count', [DashboardController::class, 'getActiveActivitiesCount'])->name('activities.count');
        Route::get('/announcements/count', [DashboardController::class, 'getAnnouncementsCount'])->name('announcements.count');

        // Activity Routes
        Route::resource('activities', ActivityController::class)->except(['show', 'destroy', 'update']);
        Route::post('activities/{activity}/edit', [ActivityController::class, 'update'])->name('activities.update');
        Route::post('activities/{activity}/delete', [ActivityController::class, 'destroy'])->name('activities.destroy');
        Route::get('activities/export/pdf', [ActivityController::class, 'exportToPDF'])->name('activities.export.pdf');

        // News Category Routes
        Route::resource('news-category', NewsCategoryController::class)->except(['show', 'destroy', 'update']);
        Route::post('news-category/{news_category}/update', [NewsCategoryController::class, 'update'])->name('news-category.update');
        Route::post('news-category/{news_category}/delete', [NewsCategoryController::class, 'destroy'])->name('news-category.destroy');

        // Chatbot Rules Routes
        Route::resource('chatbot-rules', ChatbotRuleController::class)->except(['show', 'destroy', 'update']);
        Route::post('chatbot-rules/{chatbot_rule}/update', [ChatbotRuleController::class, 'update'])->name('chatbot-rules.update');
        Route::post('chatbot-rules/{chatbot_rule}/delete', [ChatbotRuleController::class, 'destroy'])->name('chatbot-rules.destroy');

        // Download Category Routes
        Route::resource('download-categories', DownloadCategoryController::class)->except(['show', 'destroy', 'update']);
        Route::post('download-categories/{downloadCategory}/update', [DownloadCategoryController::class, 'update'])->name('download-categories.update');
        Route::post('download-categories/{downloadCategory}/delete', [DownloadCategoryController::class, 'destroy'])->name('download-categories.destroy');

        // News Routes
        Route::resource('news', NewsController::class)->except(['show', 'destroy', 'update']);
        Route::post('news/{news}/update', [NewsController::class, 'update'])->name('news.update');
        Route::post('news/{news}/delete', [NewsController::class, 'destroy'])->name('news.destroy');
        Route::post('{news_id}/toggle-active', [NewsController::class, 'toggleActive'])->name('news.toggleActive');

        // Download Routes
        Route::resource('downloads', DownloadController::class)->except(['show', 'destroy', 'update']);
        Route::post('downloads/{download}/update', [DownloadController::class, 'update'])->name('downloads.update');
        Route::post('downloads/{download}/delete', [DownloadController::class, 'destroy'])->name('downloads.destroy');

        // Announcement Routes
        Route::resource('announcement', AnnouncementController::class)->except(['show', 'destroy', 'update']);
        Route::post('announcement/{announcement}/update', [AnnouncementController::class, 'update'])->name('announcement.update');
        Route::post('announcement/{announcement}/delete', [AnnouncementController::class, 'destroy'])->name('announcement.destroy');

        Route::resource('announcement-category', AnnouncementCategoryController::class)->except(['show', 'destroy', 'update']);
        Route::post('announcement-category/{announcement_category}/update', [AnnouncementCategoryController::class, 'update'])->name('announcement-category.update');
        Route::post('announcement-category/{announcement_category}/delete', [AnnouncementCategoryController::class, 'destroy'])->name('announcement-category.destroy');
        Route::post('announcement-category/{category_id}/toggle-active', [AnnouncementCategoryController::class, 'toggleActive'])->name('announcement-category.toggle-active');

        // Feature-based Routes
        Route::middleware(['feature:layanan'])->group(function () {
            Route::get('/layanan', function () {
                return Inertia::render('Admin/Layanan', ['auth' => ['user' => Auth::user()]]);
            })->name('layanan');
        });

        Route::middleware(['feature:kegiatan'])->group(function () {
            Route::get('/kegiatan', function () {
                return Inertia::render('Admin/Kegiatan', ['auth' => ['user' => Auth::user()]]);
            })->name('kegiatan');
        });

        Route::middleware(['feature:organisasi'])->group(function () {
            Route::get('/organisasi', function () {
                return Inertia::render('Admin/Organisasi', ['auth' => ['user' => Auth::user()]]);
            })->name('organisasi');
        });

        // News and Announcement Routes (Kemahasiswaan, AdminBEM)
        Route::middleware(['role:kemahasiswaan,adminbem'])->group(function () {
            // BEM Routes
            Route::get('bem', [BemController::class, 'index'])->name('bem.index');
            Route::resource('bem', BemController::class)->except(['show', 'destroy', 'update']);
            Route::put('bem/{bem}/update', [BemController::class, 'update'])->name('bem.update');
            Route::post('bem/{bem}/delete', [BemController::class, 'destroy'])->name('bem.delete');
            Route::post('bem/{bem}/toggle-active', [BemController::class, 'toggleActive'])->name('bem.toggle-active');
            Route::get('bem/{bem}', [BemController::class, 'showDetail'])->name('bem.show');
        });

        // Achievement, Counseling, and Scholarship Routes (Kemahasiswaan Only)
        Route::middleware(['role:kemahasiswaan'])->group(function () {
            Route::resource('achievements', AchievementController::class)->except(['show', 'destroy', 'update']);
            Route::post('achievements/{achievement}/update', [AchievementController::class, 'update'])->name('achievements.update');
            Route::post('achievements/{achievement}/delete', [AchievementController::class, 'destroy'])->name('achievements.destroy');
            Route::post('achievements/{achievement_id}/toggle-active', [AchievementController::class, 'toggleActive'])->name('achievements.toggleActive');

            // Download Routes
            Route::resource('downloads', DownloadController::class)->except(['show', 'destroy', 'update']);
            Route::post('downloads/{download}/update', [DownloadController::class, 'update'])->name('downloads.update');
            Route::post('downloads/{download}/delete', [DownloadController::class, 'destroy'])->name('downloads.destroy');

            // Meta Routes
            Route::resource('meta', MetaController::class)->except(['show', 'destroy', 'update']);
            Route::post('meta/{meta}/update', [MetaController::class, 'update'])->name('meta.update');
            Route::post('meta/{meta}/delete', [MetaController::class, 'destroy'])->name('meta.destroy');
            // Route::patch('meta/{meta}/toggle-active', [MetaController::class, 'toggleActive'])->name('meta.toggle-active');
            // Route::post('meta/upload-image', [MetaController::class, 'uploadImage'])->name('meta.upload-image');
            Route::post('meta/{meta}/toggle-active', [MetaController::class, 'toggleActive'])->name('meta.toggle-active'); // Ubah ke POST sementara
            // Achievement Type Routes
            Route::resource('achievement-type', AchievementTypeController::class)->except(['show', 'destroy', 'update']);
            Route::post('achievement-type/{achievement_type}/update', [AchievementTypeController::class, 'update'])->name('achievement-type.update');
            Route::post('achievement-type/{achievement_type}/delete', [AchievementTypeController::class, 'destroy'])->name('achievement-type.destroy');

            Route::get('/counseling', [CounselingController::class, 'indexAdmin'])->name('counseling.index');
            Route::post('/counseling/{id}', [CounselingController::class, 'update'])->name('counseling.update');

            Route::resource('scholarship-category', ScholarshipCategoryController::class)->except(['show', 'destroy', 'update']);
            Route::post('scholarship-category/{scholarship_category}/update', [ScholarshipCategoryController::class, 'update'])->name('scholarship-category.update');
            Route::post('scholarship-category/{scholarship_category}/delete', [ScholarshipCategoryController::class, 'destroy'])->name('scholarship-category.destroy');
            Route::patch('scholarship-category/{category_id}/toggle-active', [ScholarshipCategoryController::class, 'toggleActive'])->name('scholarship-category.toggle-active');

            // Scholarship Routes
            Route::resource('scholarship', ScholarshipController::class)->except(['show', 'destroy', 'update']);
            Route::post('scholarship/{scholarship}/update', [ScholarshipController::class, 'update'])->name('scholarship.update');
            Route::post('scholarship/{scholarship}/delete', [ScholarshipController::class, 'destroy'])->name('scholarship.destroy');
            Route::patch('scholarship/{scholarship_id}/toggle-active', [ScholarshipController::class, 'toggleActive'])->name('scholarship.toggle-active');
            Route::get('/scholarship/pdf', [ScholarshipController::class, 'exportPDF'])->name('scholarship.pdf');

            // Organization Admin Routes
            Route::get('/organization-admins', [ApiProxyController::class, 'showStudents'])->name('organization-admins.index');
            Route::post('/organization-admins/{user}/toggle-status', [OrganizationAdminController::class, 'toggleStatus'])->name('organization-admins.toggleStatus');
            Route::post('/organization-admins/set-role', [OrganizationAdminController::class, 'setRole'])->name('organization-admins.setRole');

            // Carousel Routes
            Route::resource('carousel', CarouselController::class)->except(['show', 'destroy', 'update']);
            Route::post('carousel/{carousel}/update', [CarouselController::class, 'update'])->name('carousel.update');
            Route::post('carousel/{carousel}/delete', [CarouselController::class, 'destroy'])->name('carousel.destroy');

            // Form Routes
            Route::resource('form', FormController::class)->except(['show', 'destroy', 'update']);
            Route::put('form/{form}/update', [FormController::class, 'update'])->name('form.update');
            Route::post('form/{form}/delete', [FormController::class, 'destroy'])->name('form.destroy');
            Route::get('/form/{form}/show', [FormController::class, 'show'])->name('form.show');
            Route::get('form/{form}/settings', [FormController::class, 'settings'])->name('form.settings');
            Route::post('form/{form}/settings', [FormController::class, 'updateSettings'])->name('form.settings.update');
            Route::get('form/{form}/responses', [FormController::class, 'responses'])->name('form.responses');
            // Route untuk ekspor formulir dengan filter status
            Route::get('/form/{form}/export/{type?}', [FormController::class, 'export'])->name('form.export');
            Route::get('form/{form}/responses/{submission}', [FormController::class, 'responseDetail'])->name('form.response.detail');
            Route::post('form/{form}/responses/{submission}/update-status', [FormController::class, 'updateStatus'])->name('form.update.status');

            // Directors Routes
            Route::resource('directors', DirectorController::class)->except(['show', 'destroy', 'update']);
            Route::post('directors/{director}/update', [DirectorController::class, 'update'])->name('directors.update');
            Route::post('directors/{director}/delete', [DirectorController::class, 'destroy'])->name('directors.destroy');
            Route::post('directors/{director_id}/toggle-active', [DirectorController::class, 'toggleActive'])->name('directors.toggleActive');
        });

        // MPM and Aspiration Routes (Kemahasiswaan, AdminMPM)
        Route::middleware(['role:kemahasiswaan,adminmpm'])->group(function () {
            Route::resource('mpm', MpmController::class)->except(['destroy', 'update']);
            Route::post('mpm/{mpm}/update', [MpmController::class, 'update'])->name('mpm.update');
            Route::post('mpm/{mpm}/delete', [MpmController::class, 'destroy'])->name('mpm.destroy');
            Route::post('mpm/{mpm}/toggle-active', [MpmController::class, 'toggleActive'])->name('mpm.toggleActive');
            Route::get('mpm/{mpm}/detail', [MpmController::class, 'showDetail'])->name('mpm.showDetail');

            // Aspiration Routes
            Route::get('/aspiration', [AspirationController::class, 'indexAdmin'])->name('aspiration.index');
            Route::get('/aspiration/{id}', [AspirationController::class, 'show'])->name('aspiration.show');
            Route::post('/aspiration/{id}/delete', [AspirationController::class, 'destroy'])->name('aspiration.destroy');
            Route::post('/aspiration/update-status', [AspirationController::class, 'updateAspirationStatus'])->name('aspiration.updateStatus');

            // Aspiration Category Routes
            Route::resource('aspiration-category', AspirationCategoryController::class)->except(['show', 'destroy', 'update']);
            Route::post('aspiration-category/{aspiration_category}/update', [AspirationCategoryController::class, 'update'])->name('aspiration-category.update');
            Route::post('aspiration-category/{aspiration_category}/delete', [AspirationCategoryController::class, 'destroy'])->name('aspiration-category.destroy');
            Route::get('/admin/aspiration-categories', [AspirationCategoryController::class, 'getCategoriesWithAspirations'])->name('admin.aspiration-categories');
        });
    });
});

// Import Authentication Routes
require __DIR__ . '/auth.php';
