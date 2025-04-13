<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BEM extends Model
{
    use HasFactory;

    protected $table = 'bem';

    protected $fillable = [
        'introduction', // Tambahkan introduction ke fillable
        'vision',
        'mission',
        'structure',
        'work_programs',
        'logo', // Tambahkan logo ke fillable
        'recruitment_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'structure' => 'array', // Cast JSON ke array
        'work_programs' => 'array',
        'mission' => 'array', // Cast mission ke array
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}