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
        $admin = User::where('email', 'adminmpm@del.ac.id')->first();

        if ($admin) {
            DB::table('announcement_categories')->insert([
                ['category_id' => 'ac01', 'category_name' => 'LIBUR', 'description' => 'Pengumuman tentang libur', 'created_by' => $admin->id],
                ['category_id' => 'ac02', 'category_name' => 'UTS', 'description' => 'Pengumuman tentang UTS', 'created_by' => $admin->id],
                ['category_id' => 'ac03', 'category_name' => 'UAS', 'description' => 'Pengumuman tentang UAS', 'created_by' => $admin->id],
                ['category_id' => 'ac04', 'category_name' => 'Beasiswa', 'description' => 'Pengumuman tentang Beasiswa', 'created_by' => $admin->id],
            ]);
        } else {
            // Log atau tampilkan pesan error
            echo "Admin dengan email adminmpm@del.ac.id tidak ditemukan.";
        }
    }
}
