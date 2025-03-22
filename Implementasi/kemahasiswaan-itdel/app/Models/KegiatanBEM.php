<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KegiatanBEM extends Model
{
    use HasFactory;

    protected $table = 'kegiatan_b_e_m_s'; // Sesuaikan dengan nama tabel di database

    protected $fillable = [
        'judul',
        'deskripsi',
        'tanggal',
    ];
}
