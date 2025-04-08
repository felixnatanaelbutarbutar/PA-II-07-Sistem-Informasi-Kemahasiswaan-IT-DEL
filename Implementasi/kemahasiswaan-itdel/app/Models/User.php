<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',             
        'name',
        'email',
        'password',
        'role',
        'nim',        // Tambahkan NIM (opsional, hanya untuk mahasiswa)
        'asrama',     // Tambahkan asrama (opsional, hanya untuk mahasiswa)
        'prodi',      // Tambahkan prodi (opsional, hanya untuk mahasiswa)
        'fakultas',   // Tambahkan fakultas (opsional, hanya untuk mahasiswa)
        'angkatan',   // Tambahkan angkatan (opsional, hanya untuk mahasiswa)
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the counseling requests for the user.
     */
    public function counselings()
    {
        return $this->hasMany(Counseling::class, 'requestBy');
    }
}