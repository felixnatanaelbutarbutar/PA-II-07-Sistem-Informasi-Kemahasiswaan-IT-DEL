<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Carousel;
use App\Helpers\RoleHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use enshrined\svgSanitize\Sanitizer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class CarouselController extends Controller
{
    /**
     * Display a listing of the carousels (Admin).
     */
    public function index()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $carousels = Carousel::orderBy('order')->get();

        return Inertia::render('Admin/Carousel/index', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'carousels' => $carousels,
        ]);
    }

    /**
     * Show the form for creating a new carousel.
     */
    public function create()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $carouselCount = Carousel::count();
        $defaultOrder = $carouselCount + 1;

        return Inertia::render('Admin/Carousel/add', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'defaultOrder' => $defaultOrder,
        ]);
    }

    /**
     * Store a newly created carousel in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|file|mimes:jpeg,png,jpg,gif,svg,bmp|max:10240', // Added bmp
            'order' => [
                'required',
                'integer',
                'min:0',
                function ($attribute, $value, $fail) {
                    $existingOrder = Carousel::where('order', $value)->exists();
                    if ($existingOrder) {
                        $fail('Urutan sudah digunakan. Silakan pilih urutan lain.');
                    }
                },
            ],
            'is_active' => 'required|boolean',
        ]);

        $user = Auth::user();

        if ($request->hasFile('image')) {
            Log::info('Uploaded file: ' . $request->file('image')->getClientOriginalName());
            Log::info('MIME type: ' . $request->file('image')->getMimeType());
            Log::info('File size: ' . $request->file('image')->getSize() / 1024 / 1024 . ' MB');
        }

        $imagePath = $request->file('image')->store('carousels', 'public');

        if ($request->file('image')->getMimeType() === 'image/svg+xml') {
            Log::info('Sanitizing SVG file...');
            $sanitizer = new Sanitizer();
            $svgContent = file_get_contents($request->file('image')->getRealPath());
            $cleanSvg = $sanitizer->sanitize($svgContent);

            if ($cleanSvg === false) {
                Log::warning('SVG sanitization failed for file: ' . $request->file('image')->getClientOriginalName());
                return response()->json([
                    'success' => false,
                    'message' => 'File SVG mengandung konten yang tidak aman.',
                    'errors' => ['image' => 'File SVG mengandung konten yang tidak aman.'],
                ], 422);
            }

            Storage::disk('public')->put($imagePath, $cleanSvg);
            Log::info('SVG file sanitized and saved: ' . $imagePath);
        }

        try {
            $carouselId = $this->generateCarouselId();

            Carousel::create([
                'carousel_id' => $carouselId,
                'title' => $request->title,
                'description' => $request->description,
                'image_path' => $imagePath,
                'order' => $request->order,
                'is_active' => $request->is_active,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            Cache::forget('carousels');

            return response()->json([
                'success' => true,
                'message' => 'Carousel berhasil ditambahkan.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error creating carousel: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create carousel: ' . $e->getMessage(),
                'errors' => ['error' => 'Failed to create carousel: ' . $e->getMessage()]
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified carousel.
     */
    public function edit($carousel_id)
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $menuItems = RoleHelper::getNavigationMenu($role);
        $permissions = RoleHelper::getRolePermissions($role);

        $carousel = Carousel::findOrFail($carousel_id);

        return Inertia::render('Admin/Carousel/edit', [
            'auth' => ['user' => $user],
            'userRole' => $role,
            'permissions' => $permissions,
            'menu' => $menuItems,
            'carousel' => $carousel,
        ]);
    }

    /**
     * Update the specified carousel in storage using POST.
     */
    public function update(Request $request, $carousel_id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,bmp|max:10240', // Added bmp
            'order' => [
                'required',
                'integer',
                'min:0',
                function ($attribute, $value, $fail) use ($carousel_id) {
                    $existingOrder = Carousel::where('order', $value)
                        ->where('carousel_id', '!=', $carousel_id)
                        ->exists();
                    if ($existingOrder) {
                        $fail('Urutan sudah digunakan. Silakan pilih urutan lain.');
                    }
                },
            ],
            'is_active' => 'required|boolean',
        ]);

        $carousel = Carousel::findOrFail($carousel_id);
        $user = Auth::user();

        $imagePath = $carousel->image_path;
        if ($request->hasFile('image')) {
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }

            Log::info('Uploaded file: ' . $request->file('image')->getClientOriginalName());
            Log::info('MIME type: ' . $request->file('image')->getMimeType());
            Log::info('File size: ' . $request->file('image')->getSize() / 1024 / 1024 . ' MB');

            $imagePath = $request->file('image')->store('carousels', 'public');

            if ($request->file('image')->getMimeType() === 'image/svg+xml') {
                Log::info('Sanitizing SVG file...');
                $sanitizer = new Sanitizer();
                $svgContent = file_get_contents($request->file('image')->getRealPath());
                $cleanSvg = $sanitizer->sanitize($svgContent);

                if ($cleanSvg === false) {
                    Log::warning('SVG sanitization failed for file: ' . $request->file('image')->getClientOriginalName());
                    return response()->json([
                        'success' => false,
                        'message' => 'File SVG mengandung konten yang tidak aman.',
                        'errors' => ['image' => 'File SVG mengandung konten yang tidak aman.'],
                    ], 422);
                }

                Storage::disk('public')->put($imagePath, $cleanSvg);
                Log::info('SVG file sanitized and saved: ' . $imagePath);
            }
        }

        try {
            $carousel->update([
                'title' => $request->title,
                'description' => $request->description,
                'image_path' => $imagePath,
                'order' => $request->order,
                'is_active' => $request->is_active,
                'updated_by' => $user->id,
            ]);

            Cache::forget('carousels');

            return response()->json([
                'success' => true,
                'message' => 'Carousel berhasil diperbarui.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating carousel: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update carousel: ' . $e->getMessage(),
                'errors' => ['error' => 'Failed to update carousel: ' . $e->getMessage()]
            ], 500);
        }
    }

    /**
     * Remove the specified carousel from storage using POST.
     */
    public function destroy(Request $request, $carousel_id)
    {
        $carousel = Carousel::findOrFail($carousel_id);

        try {
            if ($carousel->image_path && Storage::disk('public')->exists($carousel->image_path)) {
                Storage::disk('public')->delete($carousel->image_path);
                Log::info('Deleted image file: ' . $carousel->image_path);
            }

            $carousel->delete();
            Log::info('Carousel deleted: ' . $carousel_id);

            Cache::forget('carousels');

            return redirect()->route('admin.carousel.index')->with('success', 'Carousel berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Error deleting carousel: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete carousel: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate a unique ID for carousel_id (e.g., car001, car002, etc.).
     */
    private function generateCarouselId()
    {
        $lastCarousel = Carousel::orderBy('carousel_id', 'desc')->first();

        if ($lastCarousel) {
            $lastIdNumber = (int) substr($lastCarousel->carousel_id, 3);
            $newIdNumber = $lastIdNumber + 1;
        } else {
            $newIdNumber = 1;
        }

        return 'car' . str_pad($newIdNumber, 3, '0', STR_PAD_LEFT);
    }
}