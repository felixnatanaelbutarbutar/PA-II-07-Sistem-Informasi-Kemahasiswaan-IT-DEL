<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\NewsCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Helpers\RoleHelper;
use Illuminate\Support\Facades\Log;

class NewsController extends Controller
{
    // Menampilkan daftar berita
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        $news = News::with('category')->get();
        $categories = NewsCategory::all();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        // Debugging flash message
        $flashSuccess = session('success');
        Log::info('Flash message in index: ' . ($flashSuccess ?? 'No flash message'));

        return Inertia::render('Admin/News/index', [
            'auth' => [
                'user' => $user
            ],
            'userRole' => $role,
            'permissions' => $permissions,
            'news' => $news,
            'categories' => $categories,
            'menu' => $menuItems,
        ]);
    }

    // Generate ID otomatis "n001", "n002", "n003", ...
    private function generateNewsId()
    {
        $lastNews = News::latest('news_id')->first();

        if ($lastNews) {
            $lastNumber = (int) substr($lastNews->news_id, 1);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return 'n' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    // Menyimpan berita baru
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:news_categories,category_id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();
        $role = strtolower($user->role);

        // Generate ID otomatis untuk news_id
        $newsId = $this->generateNewsId();

        // Upload gambar jika ada
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('news_images', 'public');
        }

        // Simpan berita baru
        News::create([
            'news_id' => $newsId,
            'title' => $request->title,
            'content' => $request->content,
            'category_id' => $request->category_id,
            'image' => $imagePath,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        // Redirect ke index dengan flash message
        return redirect()->route('admin.news.index')
            ->with('success', 'Berita berhasil ditambahkan.');
    }

    // Mengupdate berita
    public function update(Request $request, $news_id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:news_categories,category_id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $news = News::findOrFail($news_id);

        // Periksa apakah ada gambar baru
        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }
            $news->image = $request->file('image')->store('news_images', 'public');
        }

        $news->update([
            'title' => $request->title,
            'content' => $request->content,
            'category_id' => $request->category_id,
            'image' => $news->image,
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('admin.news.index')->with('success', 'Berita berhasil diperbarui.');
    }

    // Menghapus berita
    public function destroy($news_id)
    {
        try {
            $news = News::findOrFail($news_id);

            // Hapus gambar jika ada
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }

            $news->delete();

            // Redirect dengan flash message
            return redirect()->route('admin.news.index')->with('success', 'Berita berhasil dihapus.');
        } catch (\Exception $e) {
            // Redirect dengan flash message untuk error
            return redirect()->route('admin.news.index')->with('error', 'Gagal menghapus berita: ' . $e->getMessage());
        }
    }

    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $categories = NewsCategory::select('category_id', 'category_name')->get();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/News/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'categories' => $categories,
            'menu' => $menuItems,
        ]);
    }

    public function edit($news_id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);

        // Ambil berita berdasarkan ID
        $news = News::with('category')->where('news_id', $news_id)->firstOrFail();
        $categories = NewsCategory::all();
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        return Inertia::render('Admin/News/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'news' => $news,
            'categories' => $categories,
            'menu' => $menuItems,
        ]);
    }

    public function guestIndex()
    {
        $newsItems = News::with('category')->orderBy('created_at', 'desc')->get();
        $categories = NewsCategory::all();

        return Inertia::render('News', [
            'newsItems' => $newsItems,
            'categories' => $categories,
        ]);
    }

    public function show($news_id)
    {
        $news = News::with('category')->findOrFail($news_id);

        return Inertia::render('NewsDetail', [
            'news' => $news,
        ]);
    }
}