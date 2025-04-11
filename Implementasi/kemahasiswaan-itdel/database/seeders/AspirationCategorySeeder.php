<?php

namespace Database\Seeders;

use App\Models\AspirationCategory;
use Illuminate\Database\Seeder;

class AspirationCategorySeeder extends Seeder
{
    public function run()
    {
        AspirationCategory::create(['name' => 'MPM']);
        AspirationCategory::create(['name' => 'BEM']);
        AspirationCategory::create(['name' => 'Keasramaan']);
        AspirationCategory::create(['name' => 'UKM']);
        AspirationCategory::create(['name' => 'Kemahasiswaan']);
        AspirationCategory::create(['name' => 'Akademik']);
        AspirationCategory::create(['name' => 'Kantin']);
        AspirationCategory::create(['name' => 'Security']);
    }
}
