<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MPM extends Model
{
    protected $table = 'mpms';
    protected $fillable = [
        'logo',
        'introduction',
        'vision',
        'mission',
        'structure',
        'recruitment_status',
        'aspiration_status',
        'is_active',
        'management_period',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'mission' => 'array',
        'structure' => 'array',
        'is_active' => 'boolean',
    ];

    public function aspirations()
    {
        return $this->hasMany(Aspiration::class, 'mpm_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
