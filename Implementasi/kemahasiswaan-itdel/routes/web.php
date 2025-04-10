<?php

use App\Models\User;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\AspirationController;
use App\Http\Controllers\CounselingController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\KegiatanBEMController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\NewsCategoryController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// Public Routes (Accessible to Guests)
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/newsguest', function () {
    return Inertia::render('News');
})->name('news.guest.index');

Route::get('/news/{news_id}', function ($news_id) {
    return Inertia::render('NewsDetail', [
        'news_id' => $news_id
    ]);
})->name('news.show');

Route::get('/announcement', function () {
    return Inertia::render('Announcement');
})->name('announcement.guest.index');

Route::get('/announcement/{announcement_id}', function () {
    return Inertia::render('AnnouncementDetail');
})->name('announcement.show');

// Counseling Routes (Accessible to Guests and Mahasiswa)
Route::get('/counseling', [CounselingController::class, 'index'])->name('counseling.index');
Route::post('/counseling', [CounselingController::class, 'store'])->name('counseling.store');

Route::get('/achievements', function () {
    return Inertia::render('Achievement');
})->name('achievements.index');

Route::get('/achievements/{achievement_id}', function () {
    return Inertia::render('AchievementDetail');
})->name('achievements.show');

// Tambahkan rute untuk chatbot
Route::get('/chatbot', function () {
    return Inertia::render('Chatbot');
})->name('chatbot.index');

// Routes untuk sisi mahasiswa/guest
Route::get('/aspiration', [AspirationController::class, 'index'])->name('aspiration.index');
Route::post('/aspiration', [AspirationController::class, 'store'])->name('aspiration.store');

// Login Route
Route::get('/login', function () {
    if (Auth::check()) {
        $user = Auth::user();
        $role = strtolower($user->role);

        // Redirect based on role
        switch ($role) {
            case 'superadmin':
                return redirect()->route('superadmin.dashboard');
            case 'kemahasiswaan':
            case 'adminbem':
            case 'adminmpm':
                return redirect()->route('admin.dashboard');
            case 'mahasiswa':
                return redirect()->route('counseling.index'); // Redirect mahasiswa ke halaman counseling
            default:
                return redirect('/');
        }
    }
    return Inertia::render('Auth/Login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
})->middleware('guest')->name('login');

// Tambahkan rute POST untuk menangani autentikasi
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    // Superadmin Routes
    // Route::prefix('superadmin')->middleware(['role:superadmin'])->group(function () {
    //     Route::get('/dashboard', function () {
    //         return Inertia::render('SuperAdmin/Dashboard', [
    //             'auth' => [
    //                 'user' => Auth::user(),
    //             ],
    //         ]);
    //     })->name('superadmin.dashboard');
    // });

    // Admin Routes (Kemahasiswaan, AdminBEM, AdminMPM)
    Route::prefix('admin')->name('admin.')->middleware(['role:kemahasiswaan,adminbem,adminmpm'])->group(function () {
        Route::get('/dashboard', function () {
            $user = Auth::user();
            $role = strtolower($user->role);
            $menuItems = RoleHelper::getNavigationMenu($role);
            $permissions = RoleHelper::getRolePermissions($role);
            $totalMahasiswa = User::where('role', 'mahasiswa')->count();

            // Ambil data pengguna dari session (data dari API CIS)
            $apiUser = session('api_user', [
                'user_id' => $user->id,
                'user_name' => $user->username,
                'email' => $user->email,
                'role' => $role,
                'status' => 1,
                'jabatan' => []
            ]);

            return Inertia::render('Admin/Dashboard', [
                'auth' => [
                    'user' => $user, // Kirim data dari API CIS
                ],
                'userRole' => $role,
                'permissions' => $permissions,
                'menu' => $menuItems,
                'totalMahasiswa' => $totalMahasiswa,
            ]);
        })->name('dashboard');

        // Feature-Specific Routes with Permission Checks
        Route::middleware(['feature:berita'])->group(function () {
            Route::get('/berita', function () {
                return Inertia::render('Admin/Berita', [
                    'auth' => [
                        'user' => Auth::user(),
                    ],
                ]);
            })->name('berita');
        });

        // Route::middleware(['feature:pengumuman'])->group(function () {
        //     Route::get('/pengumuman', function () {
        //         return Inertia::render('Admin/Pengumuman', [
        //             'auth' => [
        //                 'user' => Auth::user(),
        //             ],
        //         ]);
        //     })->name('pengumuman');
        // });

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
            Route::resource('news', NewsController::class)->except(['show', 'destroy', 'update']);
            Route::post('news/{news}/update', [NewsController::class, 'update'])->name('news.update');
            Route::post('news/{news}/delete', [NewsController::class, 'destroy'])->name('news.destroy');

            Route::resource('announcement', AnnouncementController::class)->except(['show', 'destroy', 'update']);
            Route::post('announcement/{announcement}/update', [AnnouncementController::class, 'update'])->name('announcement.update');
            Route::post('announcement/{announcement}/delete', [AnnouncementController::class, 'destroy'])->name('announcement.destroy');
        });

        // Achievement, News Category, Counseling, and Aspiration Routes (Kemahasiswaan Only)
        Route::middleware(['role:kemahasiswaan'])->group(function () {
            Route::resource('achievements', AchievementController::class)->except(['show', 'destroy', 'update']);
            Route::post('achievements/{achievement}/update', [AchievementController::class, 'update'])->name('achievements.update');
            Route::post('achievements/{achievement}/delete', [AchievementController::class, 'destroy'])->name('achievements.destroy');

            Route::resource('news-category', NewsCategoryController::class)->except(['show', 'destroy', 'update']);
            Route::post('news-category/{news_category}/update', [NewsCategoryController::class, 'update'])->name('news-category.update');
            Route::post('news-category/{news_category}/delete', [NewsCategoryController::class, 'destroy'])->name('news-category.destroy');

            Route::get('/counseling', [CounselingController::class, 'indexAdmin'])->name('counseling.index');
            Route::post('/counseling/{id}', [CounselingController::class, 'update'])->name('counseling.update');

            Route::resource('aspiration', AspirationController::class)->except(['create', 'store', 'edit', 'update', 'destroy']);
            Route::post('aspiration/{aspiration}/delete', [AspirationController::class, 'destroy'])->name('aspiration.destroy');
        });

        // Kegiatan BEM Routes (AdminBEM Only)
        Route::prefix('bem')->name('bem.')->middleware(['role:adminbem'])->group(function () {
            Route::resource('kegiatan', KegiatanBEMController::class)->except(['create', 'edit', 'destroy', 'update']);
            Route::post('kegiatan/{kegiatan}/update', [KegiatanBEMController::class, 'update'])->name('kegiatan.update');
            Route::post('kegiatan/{kegiatan}/delete', [KegiatanBEMController::class, 'destroy'])->name('kegiatan.destroy');
        });
    });
});

// Import Authentication Routes
require __DIR__ . '/auth.php';