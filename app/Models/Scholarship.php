<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Scholarship extends Model
{
    protected $primaryKey = 'scholarship_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'scholarship_id',
        'name',
        'description',
        'poster',
        'category_id',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(ScholarshipCategory::class, 'category_id', 'category_id');
    }
    public function forms()
    {
        return $this->hasMany(ScholarshipForm::class, 'scholarship_id', 'scholarship_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}   