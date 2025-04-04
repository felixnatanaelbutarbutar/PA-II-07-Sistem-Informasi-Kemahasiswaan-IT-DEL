<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            NewsCategorySeeder::class,
            AnnouncementCategorySeeder::class,
            UserSeeder::class,
            AchievementTypesSeeder::class,
            ChatbotRulesSeeder::class,
        ]);
    }
}
