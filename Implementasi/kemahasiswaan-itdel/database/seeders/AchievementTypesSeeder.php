<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AchievementType;
use App\Models\User;

class AchievementTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Fetch an existing user to set as created_by and updated_by (or set to null if no users exist)
        $user = User::first();
        $userId = $user ? $user->id : null;

        // Sample data for achievement types
        $achievementTypes = [
            [
                'type_id' => 'TYPE000001',
                'type_name' => 'Academic Competition',
                'description' => 'Achievements related to academic competitions such as math olympiads, science fairs, or debate tournaments.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
            [
                'type_id' => 'TYPE000002',
                'type_name' => 'Sports Tournament',
                'description' => 'Achievements in sports tournaments, including team sports like soccer or individual sports like swimming.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
            [
                'type_id' => 'TYPE000003',
                'type_name' => 'Arts and Culture',
                'description' => 'Achievements in arts and cultural events, such as music competitions, dance performances, or art exhibitions.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
            [
                'type_id' => 'TYPE000004',
                'type_name' => 'Community Service',
                'description' => 'Achievements related to community service projects, such as organizing charity events or volunteering programs.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
            [
                'type_id' => 'TYPE000005',
                'type_name' => 'Innovation and Technology',
                'description' => 'Achievements in innovation and technology, such as robotics competitions, coding hackathons, or tech startups.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
        ];

        // Insert the data into the achievement_types table
        foreach ($achievementTypes as $type) {
            AchievementType::create($type);
        }
    }
}