<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BEM extends Model
{
    use HasFactory;

    protected $table = 'bem';

    protected $fillable = [
        'vision',
        'mission',
        'structure',
        'work_programs',
        'recruitment_status',
    ];

    protected $casts = [
        'structure' => 'array', // Cast JSON ke array
        'work_programs' => 'array',
    ];
}