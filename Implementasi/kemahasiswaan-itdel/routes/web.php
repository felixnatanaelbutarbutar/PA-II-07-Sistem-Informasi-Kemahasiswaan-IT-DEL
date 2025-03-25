<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\News;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\KegiatanBEMController; // Tambahkan Controller Kegiatan BEM
use App\Helpers\RoleHelper;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\AnnouncementController;



Route::get('/', function () {
    $news = News::orderBy('created_at', 'desc')->take(3)->get();

    // dd($news); // Debug: Pastikan `news` berisi array

    return Inertia::render('Home', [
        'news' => $news
    ]);
})->name('home');


// Login Routeda
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
                return redirect()->route('mahasiswa.dashboard');
            default:
                return redirect('/');
        }
    }
    return Inertia::render('Auth/Login', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
})->middleware('guest')->name('login');

Route::middleware(['auth'])->group(function () {
    // Superadmin routes
    Route::middleware(['role:superadmin'])->prefix('superadmin')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('SuperAdmin/Dashboard', [
                'auth' => [
                    'user' => Auth::user()
                ]
            ]);
        })->name('superadmin.dashboard');

        // Add other superadmin specific routes here
    });

    // Consolidated Admin Dashboard for Kemahasiswaan, AdminBEM, AdminMPM
    Route::middleware(['role:kemahasiswaan,adminbem,adminmpm'])->prefix('admin')->group(function () {
        // Dashboard route - accessible to all admin roles
        Route::get('/dashboard', function () {
            $user = Auth::user();
            $role = strtolower($user->role);

            // Get menu items and permissions for the role
            $menuItems = RoleHelper::getNavigationMenu($role);
            $permissions = RoleHelper::getRolePermissions($role);

            // Hitung total mahasiswa
            $totalMahasiswa = User::where('role', 'mahasiswa')->count();

            return Inertia::render('Admin/Dashboard', [
                'auth' => [
                    'user' => $user
                ],
                'userRole' => $role,
                'permissions' => $permissions,
                'menu' => $menuItems,
                'totalMahasiswa' => $totalMahasiswa // Kirim ke frontend
            ]);
        })->name('admin.dashboard');

        // Feature-specific routes with permission checks
        Route::middleware(['feature:berita'])->group(function () {
            Route::get('/berita', function () {
                return Inertia::render('Admin/Berita', [
                    'auth' => [
                        'user' => Auth::user()
                    ]
                ]);
            })->name('admin.berita');
        });

        Route::middleware(['feature:pengumuman'])->group(function () {
            Route::get('/pengumuman', function () {
                return Inertia::render('Admin/Pengumuman', [
                    'auth' => [
                        'user' => Auth::user()
                    ]
                ]);
            })->name('admin.pengumuman');
        });

        Route::middleware(['feature:layanan'])->group(function () {
            Route::get('/layanan', function () {
                return Inertia::render('Admin/Layanan', [
                    'auth' => [
                        'user' => Auth::user()
                    ]
                ]);
            })->name('admin.layanan');
        });

        Route::middleware(['feature:kegiatan'])->group(function () {
            Route::get('/kegiatan', function () {
                return Inertia::render('Admin/Kegiatan', [
                    'auth' => [
                        'user' => Auth::user()
                    ]
                ]);
            })->name('admin.kegiatan');
        });

        Route::middleware(['feature:organisasi'])->group(function () {
            Route::get('/organisasi', function () {
                return Inertia::render('Admin/Organisasi', [
                    'auth' => [
                        'user' => Auth::user()
                    ]
                ]);
            })->name('admin.organisasi');
        });
    });

    // 🔥 Tambahkan CRUD Kegiatan untuk Admin BEMf
    Route::middleware(['role:adminbem'])->prefix('admin/bem')->group(function () {
        Route::get('/kegiatan', [KegiatanBEMController::class, 'index'])->name('admin.bem.kegiatan');
        Route::post('/kegiatan', [KegiatanBEMController::class, 'store'])->name('admin.bem.kegiatan.store');
        Route::get('/kegiatan/{id}', [KegiatanBEMController::class, 'show'])->name('admin.bem.kegiatan.show');
        Route::put('/kegiatan/{id}', [KegiatanBEMController::class, 'update'])->name('admin.bem.kegiatan.update');
        Route::delete('/kegiatan/{id}', [KegiatanBEMController::class, 'destroy'])->name('admin.bem.kegiatan.destroy');
    });

    Route::middleware(['auth'])->group(function () {
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::middleware(['role:kemahasiswaan,adminbem'])->group(function () {
                // Halaman daftar berita
                Route::get('/news', [NewsController::class, 'index'])->name('news.index');
                // Halaman tambah berita
                Route::get('/news/add', [NewsController::class, 'create'])->name('news.create');
                // Menambahkan berita baru
                Route::post('/news', [NewsController::class, 'store'])->name('news.store');
                // Halaman edit berita
                Route::get('/news/edit/{news_id}', [NewsController::class, 'edit'])->name('news.edit');
                // Update berita
                Route::put('/news/{news_id}', [NewsController::class, 'update'])->name('news.update');
                // Hapus berita
                Route::delete('/news/{news_id}', [NewsController::class, 'destroy'])->name('news.destroy');

                Route::get('/announcement', [AnnouncementController::class, 'index'])->name('announcement.index');
                Route::get('/announcement/add', [AnnouncementController::class, 'create'])->name('announcement.create');
                Route::post('/announcement', [AnnouncementController::class, 'store'])->name('announcement.store');
                Route::get('/announcement/edit/{announcement}', [AnnouncementController::class, 'edit'])->name('announcement.edit');
                Route::put('/announcement/{announcement}', [AnnouncementController::class, 'update'])->name('announcement.update');
                Route::delete('/announcement/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcement.destroy');
            
            });
        });
    });


    // Guest routes
    Route::get('/newsguest', [NewsController::class, 'guestIndex'])->name('news.guest.index');
    Route::get('/news/{news_id}', [NewsController::class, 'show'])->name('news.show');



    // Mahasiswa routes
    Route::middleware(['role:mahasiswa'])->prefix('mahasiswa')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Mahasiswa/Dashboard', [
                'auth' => [
                    'user' => Auth::user()
                ]
            ]);
        })->name('mahasiswa.dashboard');

        // Add other mahasiswa specific routes here
    });
});



// Import file auth routes
require __DIR__ . '/auth.php';
