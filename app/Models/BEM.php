<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BEM extends Model
{
    use HasFactory;

    protected $table = 'bem';

    protected $fillable = [
        'cabinet_name', // Tambah ke fillable
        'introduction',
        'vision',
        'mission',
        'structure',
        'work_programs',
        'logo',
        'recruitment_status',
        'is_active', // Tambah ke fillable
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'structure' => 'array',
        'work_programs' => 'array',
        'mission' => 'array',
        'is_active' => 'boolean', // Cast is_active ke boolean
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
