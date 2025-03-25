<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnnouncementCategorySeeder extends Seeder
{
    public function run()
    {
        DB::table('announcement_categories')->insert([
            ['category_id' => 'ac01', 'category_name' => 'LIBUR', 'description' => 'Pengumuman tentang libur', 'created_by' => '00000000-0000-0000-0000-000000000000'],
            ['category_id' => 'ac02', 'category_name' => 'UTS', 'description' => 'Pengumuman tentang UTS', 'created_by' => '00000000-0000-0000-0000-000000000000'],
            ['category_id' => 'ac03', 'category_name' => 'UAS', 'description' => 'Pengumuman tentang UAS', 'created_by' => '00000000-0000-0000-0000-000000000000'],
            ['category_id' => 'ac04', 'category_name' => 'Beasiswa', 'description' => 'Pengumuman tentang Beasiswa', 'created_by' => '00000000-0000-0000-0000-000000000000'],
        ]);
    }
}
