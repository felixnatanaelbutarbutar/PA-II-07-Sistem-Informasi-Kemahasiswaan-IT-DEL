<?php

use App\Models\News;
use App\Models\NewsCategory;
use App\Models\User;
use Inertia\Inertia;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\CounselingController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\KegiatanBEMController;


// Public Routes (Accessible to Guests)
Route::get('/', function () {
    $news = News::with('category') // Eager-load the category relationship
        ->orderBy('created_at', 'desc')
        ->take(4)
        ->get();
    $categories = NewsCategory::all();

    return Inertia::render('Home', [
        'news' => $news,
        'categories' => $categories,
    ]);
})->name('home');

Route::get('/newsguest', [NewsController::class, 'guestIndex'])->name('news.guest.index');
Route::get('/news/{news_id}', [NewsController::class, 'show'])->name('news.show');
Route::get('/announcementguest', [AnnouncementController::class, 'guestIndex'])->name('announcement.guest.index');

// Counseling Routes (Accessible to Guests and Mahasiswa)
Route::get('/counseling', [CounselingController::class, 'index'])->name('counseling.index');
Route::post('/counseling', [CounselingController::class, 'store'])->name('counseling.store');

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
                return redirect('/'); // Redirect mahasiswa to homepage
            default:
                return redirect('/');
        }
    }
    return Inertia::render('Auth/Login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
})->middleware('guest')->name('login');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    // Superadmin Routes
    Route::prefix('superadmin')->middleware(['role:superadmin'])->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('SuperAdmin/Dashboard', [
                'auth' => [
                    'user' => Auth::user(),
                ],
            ]);
        })->name('superadmin.dashboard');
    });

    // Admin Routes (Kemahasiswaan, AdminBEM, AdminMPM)
    Route::prefix('admin')->name('admin.')->middleware(['role:kemahasiswaan,adminbem,adminmpm'])->group(function () {
        // Admin Dashboard
        Route::get('/dashboard', function () {
            $user = Auth::user();
            $role = strtolower($user->role);
            $menuItems = RoleHelper::getNavigationMenu($role);
            $permissions = RoleHelper::getRolePermissions($role);
            $totalMahasiswa = User::where('role', 'mahasiswa')->count();

            return Inertia::render('Admin/Dashboard', [
                'auth' => [
                    'user' => $user,
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

        Route::middleware(['feature:pengumuman'])->group(function () {
            Route::get('/pengumuman', function () {
                return Inertia::render('Admin/Pengumuman', [
                    'auth' => [
                        'user' => Auth::user(),
                    ],
                ]);
            })->name('pengumuman');
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

        // News Routes (Kemahasiswaan, AdminBEM)
        Route::middleware(['role:kemahasiswaan,adminbem'])->group(function () {
            Route::get('/news', [NewsController::class, 'index'])->name('news.index');
            Route::get('/news/add', [NewsController::class, 'create'])->name('news.create');
            Route::post('/news', [NewsController::class, 'store'])->name('news.store');
            Route::get('/news/edit/{news_id}', [NewsController::class, 'edit'])->name('news.edit');
            Route::put('/news/{news_id}', [NewsController::class, 'update'])->name('news.update');
            Route::delete('/news/{news_id}', [NewsController::class, 'destroy'])->name('news.destroy');

            // Announcement Routes
            Route::get('/announcement', [AnnouncementController::class, 'index'])->name('announcement.index');
            Route::get('/announcement/add', [AnnouncementController::class, 'create'])->name('announcement.create');
            Route::post('/announcement', [AnnouncementController::class, 'store'])->name('announcement.store');
            Route::get('/announcement/edit/{announcement}', [AnnouncementController::class, 'edit'])->name('announcement.edit');
            Route::put('/announcement/{announcement}', [AnnouncementController::class, 'update'])->name('announcement.update');
            Route::delete('/announcement/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcement.destroy');
        });

        // Achievement Routes (Kemahasiswaan Only)
        Route::middleware(['role:kemahasiswaan'])->group(function () {
            Route::get('/achievements', [AchievementController::class, 'index'])->name('achievements.index');
            Route::get('/achievements/add', [AchievementController::class, 'create'])->name('achievements.create');
            Route::post('/achievements', [AchievementController::class, 'store'])->name('achievements.store');
            Route::get('/achievements/edit/{achievement}', [AchievementController::class, 'edit'])->name('achievements.edit');
            Route::put('/achievements/{achievement}', [AchievementController::class, 'update'])->name('achievements.update');
            Route::delete('/achievements/{achievement}', [AchievementController::class, 'destroy'])->name('achievements.destroy');

            Route::get('/counseling', [CounselingController::class, 'indexAdmin'])->name('counseling.index');
            Route::post('/counseling/{id}', [CounselingController::class, 'update'])->name('counseling.update');

        });


        // Kegiatan BEM Routes (AdminBEM Only)
        Route::prefix('bem')->middleware(['role:adminbem'])->group(function () {
            Route::get('/kegiatan', [KegiatanBEMController::class, 'index'])->name('bem.kegiatan');
            Route::post('/kegiatan', [KegiatanBEMController::class, 'store'])->name('bem.kegiatan.store');
            Route::get('/kegiatan/{id}', [KegiatanBEMController::class, 'show'])->name('bem.kegiatan.show');
            Route::put('/kegiatan/{id}', [KegiatanBEMController::class, 'update'])->name('bem.kegiatan.update');
            Route::delete('/kegiatan/{id}', [KegiatanBEMController::class, 'destroy'])->name('bem.kegiatan.destroy');
        });
    });
});

// Import Authentication Routes
require __DIR__ . '/auth.php';