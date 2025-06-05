<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormSetting extends Model
{
    use HasFactory;

    protected $table = 'form_settings';
    protected $primaryKey = 'setting_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'setting_id',
        'form_id',
        'accept_responses',
        'submission_start',
        'submission_deadline',
        'max_submissions',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'accept_responses' => 'boolean',
        'created_by' => 'integer',
        'updated_by' => 'integer',
        'submission_start' => 'datetime',
        'submission_deadline' => 'datetime',
    ];

    public function form()
    {
        return $this->belongsTo(ScholarshipForm::class, 'form_id', 'form_id');
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