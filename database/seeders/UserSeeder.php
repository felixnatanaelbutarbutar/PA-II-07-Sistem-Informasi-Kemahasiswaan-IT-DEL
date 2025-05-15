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
        User::create([
            'username' => 'adminmpm',
            'name' => 'Admin MPM',
            'email' => 'adminmpm@del.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'adminmpm',
            'nim' => null,
            'asrama' => null,
            'prodi' => null,
            'fakultas' => null,
            'angkatan' => null,
        ]);

        User::create([
            'username' => 'adminbem',
            'name' => 'Admin BEM',
            'email' => 'adminbem@del.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'adminbem',
            'nim' => null,
            'asrama' => null,
            'prodi' => null,
            'fakultas' => null,
            'angkatan' => null,
        ]);
    }
}
