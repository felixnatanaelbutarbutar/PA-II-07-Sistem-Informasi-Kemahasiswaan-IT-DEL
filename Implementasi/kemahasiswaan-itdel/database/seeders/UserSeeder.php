<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tambah user Kemahasiswaan
        User::create([
            'name' => 'Kemahasiswaan',
            'email' => 'kemahasiswaan@example.com',
            'password' => Hash::make('password'),
            'role' => 'kemahasiswaan',
        ]);

        // Tambah user Admin BEM
        User::create([
            'name' => 'Admin BEM',
            'email' => 'adminbem@example.com',
            'password' => Hash::make('password'),
            'role' => 'adminbem',
        ]);

        // Tambah user Admin MPM
        User::create([
            'name' => 'Admin MPM',
            'email' => 'adminmpm@example.com',
            'password' => Hash::make('password'),
            'role' => 'adminmpm',
        ]);

        // Tambah user Mahasiswa
        User::create([
            'name' => 'Mahasiswa',
            'email' => 'mahasiswa@example.com',
            'password' => Hash::make('password'),
            'role' => 'mahasiswa',
        ]);
    }
}
