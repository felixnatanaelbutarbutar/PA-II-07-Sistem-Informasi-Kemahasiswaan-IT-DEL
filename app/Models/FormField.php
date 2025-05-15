<?php

// app/Models/FormField.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormField extends Model
{
    protected $primaryKey = 'field_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'field_id',
        'form_id',
        'section_title',
        'field_name',
        'field_type',
        'is_required',
        'options',
        'order',
        'file_path',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    // Relationships
    public function form()
    {
        return $this->belongsTo(ScholarshipForm::class, 'form_id', 'form_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by', 'id');
    }
}
