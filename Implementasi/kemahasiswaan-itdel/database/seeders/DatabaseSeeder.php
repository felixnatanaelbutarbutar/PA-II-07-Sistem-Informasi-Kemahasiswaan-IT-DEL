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
        // Create test users for each role
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('password'),
            'role' => 'superadmin',
        ]);

        User::create([
            'name' => 'Kemahasiswaan',
            'email' => 'kemahasiswaan@example.com',
            'password' => Hash::make('password'),
            'role' => 'kemahasiswaan',
        ]);

        User::create([
            'name' => 'Admin BEM',
            'email' => 'adminbem@example.com',
            'password' => Hash::make('password'),
            'role' => 'adminbem',
        ]);

        User::create([
            'name' => 'Admin MPM',
            'email' => 'adminmpm@example.com',
            'password' => Hash::make('password'),
            'role' => 'adminmpm',
        ]);

        User::create([
            'name' => 'Mahasiswa',
            'email' => 'mahasiswa@example.com',
            'password' => Hash::make('password'),
            'role' => 'mahasiswa',
        ]);
    }
}
