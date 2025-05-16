<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AnnouncementCategorySeeder extends Seeder
{
    public function run()
    {
        // Ambil user admin yang mau digunakan
        $admin = User::where('email', 'johannes@del.ac.id')->first();

        if ($admin) {
            DB::table('announcement_categories')->insert([
                [
                    'category_id' => 'ac001',
                    'category_name' => 'LIBUR',
                    'description' => 'Pengumuman tentang hari libur akademik dan nasional',
                    'is_active' => true,
                    'created_by' => $admin->id,
                    'updated_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'category_id' => 'ac002',
                    'category_name' => 'UTS',
                    'description' => 'Pengumuman terkait Ujian Tengah Semester',
                    'is_active' => true,
                    'created_by' => $admin->id,
                    'updated_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'category_id' => 'ac003',
                    'category_name' => 'UAS',
                    'description' => 'Pengumuman terkait Ujian Akhir Semester',
                    'is_active' => true,
                    'created_by' => $admin->id,
                    'updated_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'category_id' => 'ac004',
                    'category_name' => 'Beasiswa',
                    'description' => 'Informasi tentang peluang beasiswa dan bantuan keuangan',
                    'is_active' => true,
                    'created_by' => $admin->id,
                    'updated_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'category_id' => 'ac005',
                    'category_name' => 'Seminar',
                    'description' => 'Pengumuman tentang seminar dan workshop akademik',
                    'is_active' => true,
                    'created_by' => $admin->id,
                    'updated_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'category_id' => 'ac006',
                    'category_name' => 'Magang',
                    'description' => 'Informasi tentang program magang dan peluang kerja',
                    'is_active' => true,
                    'created_by' => $admin->id,
                    'updated_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'category_id' => 'ac007',
                    'category_name' => 'Kegiatan Kampus',
                    'description' => 'Pengumuman tentang kegiatan mahasiswa dan acara kampus',
                    'is_active' => true,
                    'created_by' => $admin->id,
                    'updated_by' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        } else {
            // Log atau tampilkan pesan error
            \Log::error('Admin dengan email johannes@del.ac.id tidak ditemukan.');
            echo "Admin dengan email johannes@del.ac.id tidak ditemukan.\n";
        }
    }
}
