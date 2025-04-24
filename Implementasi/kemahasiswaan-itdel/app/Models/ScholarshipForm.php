<?php

namespace App\Models;

use App\Models\FormField;
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
        'created_by',
        'updated_by',
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
