<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NewsCategorySeeder extends Seeder
{
    public function run()
    {
        DB::table('news_categories')->insert([
            ['category_id' => 'nc01', 'category_name' => 'Teknologi', 'description' => 'Berita tentang teknologi', 'created_by' => '00000000-0000-0000-0000-000000000000'],
            ['category_id' => 'nc02', 'category_name' => 'Pendidikan', 'description' => 'Berita tentang pendidikan', 'created_by' => '00000000-0000-0000-0000-000000000000'],
        ]);
    }
}
