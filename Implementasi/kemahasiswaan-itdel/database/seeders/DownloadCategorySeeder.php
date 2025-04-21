<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DownloadCategory;
use App\Models\User;

class DownloadCategorySeeder extends Seeder
{
    public function run()
    {
        $user = User::first(); // Ambil user pertama sebagai creator

        DownloadCategory::create([
            'name' => 'Dokumen Akademik',
            'description' => 'Dokumen terkait akademik seperti panduan skripsi dan jadwal kuliah.',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        DownloadCategory::create([
            'name' => 'Dokumen Organisasi',
            'description' => 'Dokumen terkait organisasi seperti laporan kegiatan dan anggaran.',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }
}