<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ScholarshipForm extends Model
{
    use HasFactory;

    protected $table = 'scholarship_forms';
    protected $primaryKey = 'form_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'form_id',
        'scholarship_id',
        'form_name',
        'description',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public function scholarship()
    {
        return $this->belongsTo(Scholarship::class, 'scholarship_id', 'scholarship_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
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
