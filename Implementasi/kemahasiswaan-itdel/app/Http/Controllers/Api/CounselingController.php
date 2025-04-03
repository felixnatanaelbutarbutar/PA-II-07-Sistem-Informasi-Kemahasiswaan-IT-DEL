<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Counseling;
use Illuminate\Http\Request;

class CounselingController extends Controller
{
    public function index()
    {
        $counselings = Counseling::orderBy('created_at', 'desc')->get();
        return response()->json($counselings);
    }

    public function show($counseling_id)
    {
        $counseling = Counseling::findOrFail($counseling_id);
        return response()->json($counseling);
    }
}