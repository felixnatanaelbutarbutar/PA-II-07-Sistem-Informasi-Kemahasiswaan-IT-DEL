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
            AnnouncementCategorySeeder::class,
            UserSeeder::class,
            ChatbotRulesSeeder::class,
            AchievementTypesSeeder::class,
        ]);
    }
}
