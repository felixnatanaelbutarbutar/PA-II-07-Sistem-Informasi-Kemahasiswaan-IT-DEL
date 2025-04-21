<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mpm extends Model
{
    protected $fillable = [
        'logo',
        'introduction',
        'vision',
        'mission',
        'structure',
        'recruitment_status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'mission' => 'array',
        'structure' => 'array',
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
