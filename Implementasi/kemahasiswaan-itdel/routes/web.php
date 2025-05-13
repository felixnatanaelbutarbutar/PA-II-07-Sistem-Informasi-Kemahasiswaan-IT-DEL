<?php

use App\Models\User;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BemController;
use App\Http\Controllers\MpmController;
use App\Http\Controllers\FormController;
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
use App\Http\Controllers\KegiatanBEMController;
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

// Tambahkan rute untuk chatbot
Route::get('/chatbot', function () {
    return Inertia::render('Chatbot');
})->name('chatbot.index');

// Routes untuk sisi mahasiswa/guest
Route::get('/aspiration', [AspirationController::class, 'index'])->name('aspiration.index');
Route::post('/aspiration', [AspirationController::class, 'store'])->name('aspiration.store');

// Route untuk halaman BEM (guest)
Route::get('/bem', [BemController::class, 'show'])->name('bem.show');

// Route untuk halaman MPM (guest) - Ditambahkan
Route::get('/mpm', [MpmController::class, 'show'])->name('mpm.show');

// Routes untuk unduhan di sisi guest
Route::get('/downloads', [DownloadController::class, 'guestIndex'])->name('downloads.guest.index');


// Guest Routes
Route::middleware('throttle:100,1')->group(function () {
    Route::get('/scholarships', [FormController::class, 'guestIndex'])->name('guest.scholarship.index');
    Route::get('/scholarships/{scholarship_id}', [FormController::class, 'guestShow'])->name('guest.scholarship.show');
    Route::get('/scholarships/form/{form_id}', [FormController::class, 'showForm'])->name('guest.form.show');
});

// Student Routes (Authenticated Mahasiswa)
Route::middleware(['auth', 'role:mahasiswa', 'throttle:100,1'])->group(function () {
    Route::get('/student/scholarships', [FormController::class, 'studentIndex'])->name('student.scholarship.index');
    Route::get('/student/scholarships/{scholarship_id}', [FormController::class, 'studentShow'])->name('student.scholarship.show');
    Route::get('/student/scholarships/form/{form_id}', [FormController::class, 'studentForm'])->name('student.form.show');
});

Route::get('/login', function () {
    if (Auth::check()) {
        $user = Auth::user();
        $role = strtolower($user->role);
        $intendedUrl = session('url.intended', route('counseling.index'));

        // Log the redirect attempt
        Log::info('Login redirect attempt', [
            'user_id' => $user->id,
            'role' => $role,
            'intended_url' => $intendedUrl,
            'session_intended' => session('url.intended'),
        ]);

        // Prevent redirect loop
        if (str_contains($intendedUrl, '/login') || $intendedUrl === url()->current()) {
            $intendedUrl = route('counseling.index');
        }

        // Redirect based on role
        switch ($role) {
            case 'superadmin':
                return redirect()->intended(route('superadmin.dashboard'));
            case 'kemahasiswaan':
            case 'adminbem':
            case 'adminmpm':
                return redirect()->intended(route('admin.dashboard'));
            case 'mahasiswa':
                if (str_contains($intendedUrl, '/scholarships')) {
                    $path = parse_url($intendedUrl, PHP_URL_PATH);
                    if (preg_match('/\/scholarships\/form\/([^\/]+)/', $path, $matches)) {
                        $redirectUrl = route('student.form.show', ['form_id' => $matches[1]]);
                    } elseif (preg_match('/\/scholarships\/([^\/]+)/', $path, $matches)) {
                        $redirectUrl = route('student.scholarship.show', ['scholarship_id' => $matches[1]]);
                    } else {
                        $redirectUrl = route('student.scholarship.index');
                    }
                } else {
                    $redirectUrl = route('counseling.index');
                }
                Log::info('Redirecting mahasiswa', ['to' => $redirectUrl]);
                return redirect($redirectUrl);
            default:
                return redirect()->intended('/');
        }
    }

    // Log guest login page access
    Log::info('Guest accessing login page', ['url' => url()->current()]);
    return Inertia::render('Auth/Login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
})->middleware('guest')->name('login');

// Keep the POST login route as is
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {

    // Admin Routes (Kemahasiswaan, AdminBEM, AdminMPM)
    Route::prefix('admin')->name('admin.')->middleware(['role:kemahasiswaan,adminbem,adminmpm'])->group(function () {

        // Rute untuk Kalender Kegiatan (Kemahasiswaan, AdminBEM, AdminMPM)
        Route::middleware(['role:kemahasiswaan,adminbem,adminmpm'])->group(function () {

            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            Route::get('/activities/count', [DashboardController::class, 'getActiveActivitiesCount'])->name('activities.count');
            Route::get('/announcements/count', [DashboardController::class, 'getAnnouncementsCount'])->name('announcements.count');

            Route::resource('activities', ActivityController::class)->except(['show']);
            Route::post('activities/{activity}/delete', [ActivityController::class, 'destroy'])->name('activities.destroy');
            // Tambahkan rute untuk ekspor PDF
            Route::get('activities/export/pdf', [ActivityController::class, 'exportToPDF'])->name('activities.export.pdf');

            Route::resource('news-category', NewsCategoryController::class)->except(['show', 'destroy', 'update']);
            Route::post('news-category/{news_category}/update', [NewsCategoryController::class, 'update'])->name('news-category.update');
            Route::post('news-category/{news_category}/delete', [NewsCategoryController::class, 'destroy'])->name('news-category.destroy');

            // Rute untuk Chatbot Rules (Kemahasiswaan, AdminBEM, AdminMPM)
            Route::resource('chatbot-rules', ChatbotRuleController::class)->except(['show', 'destroy', 'update']);
            Route::post('chatbot-rules/{chatbot_rule}/update', [ChatbotRuleController::class, 'update'])->name('chatbot-rules.update');
            Route::post('chatbot-rules/{chatbot_rule}/delete', [ChatbotRuleController::class, 'destroy'])->name('chatbot-rules.destroy');

            Route::resource('download-categories', DownloadCategoryController::class)->except(['show', 'destroy', 'update']);
            Route::post('download-categories/{downloadCategory}/update', [DownloadCategoryController::class, 'update'])->name('download-categories.update');
            Route::post('download-categories/{downloadCategory}/delete', [DownloadCategoryController::class, 'destroy'])->name('download-categories.destroy');

            Route::resource('news', NewsController::class)->except(['show', 'destroy', 'update']);
            Route::post('news/{news}/update', [NewsController::class, 'update'])->name('news.update');
            Route::post('news/{news}/delete', [NewsController::class, 'destroy'])->name('news.destroy');
            Route::post('{news_id}/toggle-active', [NewsController::class, 'toggleActive'])->name('news.toggleActive');

            Route::resource('downloads', DownloadController::class)->except(['show', 'destroy', 'update']);
            Route::post('downloads/{download}/update', [DownloadController::class, 'update'])->name('downloads.update');
            Route::post('downloads/{download}/delete', [DownloadController::class, 'destroy'])->name('downloads.destroy');

            Route::resource('announcement', AnnouncementController::class)->except(['show', 'destroy', 'update']);
            Route::post('announcement/{announcement}/update', [AnnouncementController::class, 'update'])->name('announcement.update');
            Route::post('announcement/{announcement}/delete', [AnnouncementController::class, 'destroy'])->name('announcement.destroy');

            Route::resource('announcement-category', AnnouncementCategoryController::class)->except(['show', 'destroy', 'update']);
            Route::post('announcement-category/{announcement_category}/update', [AnnouncementCategoryController::class, 'update'])->name('announcement-category.update');
            Route::post('announcement-category/{announcement_category}/delete', [AnnouncementCategoryController::class, 'destroy'])->name('announcement-category.destroy');
        });

        Route::middleware(['feature:layanan'])->group(function () {
            Route::get('/layanan', function () {
                return Inertia::render('Admin/Layanan', [
                    'auth' => [
                        'user' => Auth::user(),
                    ],
                ]);
            })->name('layanan');
        });

        Route::middleware(['feature:kegiatan'])->group(function () {
            Route::get('/kegiatan', function () {
                return Inertia::render('Admin/Kegiatan', [
                    'auth' => [
                        'user' => Auth::user(),
                    ],
                ]);
            })->name('kegiatan');
        });

        Route::middleware(['feature:organisasi'])->group(function () {
            Route::get('/organisasi', function () {
                return Inertia::render('Admin/Organisasi', [
                    'auth' => [
                        'user' => Auth::user(),
                    ],
                ]);
            })->name('organisasi');
        });



        // News and Announcement Routes (Kemahasiswaan, AdminBEM)
        Route::middleware(['role:kemahasiswaan,adminbem'])->group(function () {
            Route::resource('bem', BemController::class)->except(['destroy', 'update']);
            Route::put('bem/{bem}/update', [BemController::class, 'update'])->name('bem.update'); // Mengubah POST menjadi PUT untuk konsistensi
            Route::delete('bem/{bem}', [BemController::class, 'destroy'])->name('bem.destroy'); // Mengubah POST menjadi DELETE dan menambahkan prefiks admin.
        });

        // Achievement, News Category, Counseling, and Aspiration Routes (Kemahasiswaan Only)
        Route::middleware(['role:kemahasiswaan'])->group(function () {
            Route::resource('achievements', AchievementController::class)->except(['show', 'destroy', 'update']);
            Route::post('achievements/{achievement}/update', [AchievementController::class, 'update'])->name('achievements.update');
            Route::post('achievements/{achievement}/delete', [AchievementController::class, 'destroy'])->name('achievements.destroy');

            // Rute untuk Achievement Type (Kemahasiswaan Only)
            Route::resource('achievement-type', AchievementTypeController::class)->except(['show', 'destroy', 'update']);
            Route::post('achievement-type/{achievement_type}/update', [AchievementTypeController::class, 'update'])->name('achievement-type.update');
            Route::post('achievement-type/{achievement_type}/delete', [AchievementTypeController::class, 'destroy'])->name('achievement-type.destroy');

            Route::get('/counseling', [CounselingController::class, 'indexAdmin'])->name('counseling.index');
            Route::post('/counseling/{id}', [CounselingController::class, 'update'])->name('counseling.update');

            Route::resource('scholarship-category', ScholarshipCategoryController::class)->except(['show', 'destroy', 'update']);
            Route::post('scholarship-category/{scholarship_category}/update', [ScholarshipCategoryController::class, 'update'])->name('scholarship-category.update');
            Route::post('scholarship-category/{scholarship_category}/delete', [ScholarshipCategoryController::class, 'destroy'])->name('scholarship-category.destroy');
            Route::patch('scholarship-category/{category_id}/toggle-active', [ScholarshipCategoryController::class, 'toggleActive'])->name('scholarship-category.toggle-active');

            // === SCHOLARSHIP ===
            Route::resource('scholarship', ScholarshipController::class)->except(['show', 'destroy', 'update']);
            Route::post('scholarship/{scholarship}/update', [ScholarshipController::class, 'update'])->name('scholarship.update');
            Route::post('scholarship/{scholarship}/delete', [ScholarshipController::class, 'destroy'])->name('scholarship.destroy');
            Route::patch('scholarship/{scholarship_id}/toggle-active', [ScholarshipController::class, 'toggleActive'])->name('scholarship.toggle-active');


            // Rute untuk Organization Admins menggunakan ApiProxyController
            Route::get('/organization-admins', [ApiProxyController::class, 'showStudents'])->name('organization-admins.index');

            // Rute lainnya untuk Organization Admins (jika masih diperlukan)
            // Route::get('/organization-admins/create', [OrganizationAdminController::class, 'create'])->name('organization-admins.create');
            // Route::post('/organization-admins', [OrganizationAdminController::class, 'store'])->name('organization-admins.store');
            Route::post('/organization-admins/{user}/toggle-status', [OrganizationAdminController::class, 'toggleStatus'])->name('organization-admins.toggleStatus');
            Route::post('/organization-admins/set-role', [OrganizationAdminController::class, 'setRole'])->name('organization-admins.setRole');
            // === CAROUSEL ===
            Route::resource('carousel', CarouselController::class)->except(['show', 'destroy', 'update']);
            Route::post('carousel/{carousel}/update', [CarouselController::class, 'update'])->name('carousel.update');
            Route::post('carousel/{carousel}/delete', [CarouselController::class, 'destroy'])->name('carousel.destroy');

            // Route::resource('form', FormController::class)->except(['show', 'destroy', 'update']);
            // Route::post('form/{form}/update', [FormController::class, 'update'])->name('form.update');
            // Route::post('form/{form}/delete', [FormController::class, 'destroy'])->name('form.destroy');
            // Route::post('form/{form}/toggleActive', [FormController::class, 'toggleActive'])->name('form.toggleActive');
            // Route::get('/form/{form}/show', [FormController::class, 'show'])->name('admin.form.show');


            // Route::get('form/{form}/settings', [FormController::class, 'settings'])->name('form.settings');
            // Route::put('form/{form}/settings', [FormController::class, 'updateSettings'])->name('form.settings.update');
            // Route::get('form/form-settings/{form}/edit', [FormController::class, 'edit'])->name('form_settings.edit');

            Route::resource('form', FormController::class)->except(['show', 'destroy', 'update']);
            Route::put('form/{form}/update', [FormController::class, 'update'])->name('form.update');
            Route::post('form/{form}/delete', [FormController::class, 'destroy'])->name('form.destroy');
            Route::get('/form/{form}/show', [FormController::class, 'show'])->name('form.show');
            Route::get('form/{form}/settings', [FormController::class, 'settings'])->name('form.settings');
            Route::post('form/{form}/settings', [FormController::class, 'updateSettings'])->name('form.settings.update');

            Route::resource('directors', DirectorController::class)->except(['show', 'destroy', 'update']);
            Route::post('directors/{director}/update', [DirectorController::class, 'update'])->name('directors.update');
            Route::post('directors/{director}/delete', [DirectorController::class, 'destroy'])->name('directors.destroy');
            Route::post('directors/{director_id}/toggle-active', [DirectorController::class, 'toggleActive'])->name('directors.toggleActive');
        });


        // MPM Routes (AdminMPM) - Ditambahkan
        Route::middleware(['role:kemahasiswaan,adminmpm'])->group(function () {
            Route::resource('mpm', MpmController::class)->except(['destroy', 'update']);
            Route::post('mpm/{mpm}/update', [MpmController::class, 'update'])->name('mpm.update');
            Route::post('mpm/{mpm}/delete', [MpmController::class, 'destroy'])->name('mpm.delete');
            // Route::delete('mpm/{mpm}', [MpmController::class, 'destroy'])->name('mpm.delete');

            // Routes untuk sisi admin (kemahasiswaan)
            Route::get('/aspiration', [AspirationController::class, 'indexAdmin'])->name('aspiration.index');
            Route::get('/aspiration/{id}', [AspirationController::class, 'show'])->name('aspiration.show');
            Route::post('/aspiration/{id}/delete', [AspirationController::class, 'destroy'])->name('aspiration.destroy');
            Route::post('/aspiration/update-status', [AspirationController::class, 'updateAspirationStatus'])->name('aspiration.updateStatus');

            // === ASPIRATION CATEGORY ===
            Route::resource('aspiration-category', AspirationCategoryController::class)->except(['show', 'destroy', 'update']);
            Route::post('aspiration-category/{aspiration_category}/update', [AspirationCategoryController::class, 'update'])->name('aspiration-category.update');
            Route::post('aspiration-category/{aspiration_category}/delete', [AspirationCategoryController::class, 'destroy'])->name('aspiration-category.destroy');

            Route::get('/admin/aspiration-categories', [AspirationCategoryController::class, 'getCategoriesWithAspirations'])->name('admin.aspiration-categories');
        });
    });
});

// Import Authentication Routes
require __DIR__ . '/auth.php';
