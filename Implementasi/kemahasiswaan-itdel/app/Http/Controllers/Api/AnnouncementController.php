<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $announcements = Announcement::with(['category', 'createdBy', 'updatedBy'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($announcements);
    }

    public function show($announcement_id)
    {
        $announcement = Announcement::with(['category', 'createdBy', 'updatedBy'])
            ->where('announcement_id', $announcement_id)
            ->firstOrFail();

        return response()->json($announcement);
    }
}