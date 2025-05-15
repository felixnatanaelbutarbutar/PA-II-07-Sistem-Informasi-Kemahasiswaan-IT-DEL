<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Director; // Asumsi model Director sudah ada
use Illuminate\Http\Request;

class DirectorController extends Controller
{
    public function getActiveWelcomeMessage()
    {
        // Ambil director yang aktif (is_active = true), ambil yang terbaru jika ada lebih dari satu
        $director = Director::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$director) {
            return response()->json(['message' => 'Kata sambutan tidak ditemukan'], 404);
        }

        return response()->json($director);
    }
}