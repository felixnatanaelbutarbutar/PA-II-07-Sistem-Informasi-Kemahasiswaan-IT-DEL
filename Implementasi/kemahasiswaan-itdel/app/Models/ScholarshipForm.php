<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScholarshipForm extends Model
{
    protected $primaryKey = 'form_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'form_id',
        'scholarship_id',
        'form_name',
        'description',
        'is_active', // Added is_active to fillable
        'created_by',
        'updated_by',
    ];


    protected $casts = [
        'is_active' => 'boolean', // Cast is_active as boolean
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    // Relationships
    public function scholarship()
    {
        return $this->belongsTo(Scholarship::class, 'scholarship_id', 'scholarship_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by', 'id');
    }

    public function fields()
    {
        return $this->hasMany(FormField::class, 'form_id', 'form_id');
    }

    public function settings()
    {
        return $this->hasOne(FormSetting::class, 'form_id', 'form_id');
    }
}
