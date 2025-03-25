<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AchievementType;
use Illuminate\Support\Str;

class AchievementTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Data awal AchievementType
        $types = [
            [
                'type_name' => 'Akademik',
                'description' => 'Prestasi dalam bidang akademik seperti lomba matematika, olimpiade sains.',
                'created_by' => Str::uuid(), // Menggunakan UUID
                'updated_by' => Str::uuid(),
            ],
            [
                'type_name' => 'Olahraga',
                'description' => 'Prestasi dalam bidang olahraga seperti futsal, badminton, basket.',
                'created_by' => Str::uuid(),
                'updated_by' => Str::uuid(),
            ],
            [
                'type_name' => 'Seni & Budaya',
                'description' => 'Prestasi dalam bidang seni seperti musik, tari, dan lukis.',
                'created_by' => Str::uuid(),
                'updated_by' => Str::uuid(),
            ],
        ];

        // Masukkan data ke dalam tabel
        foreach ($types as $type) {
            AchievementType::create($type);
        }
    }
}
