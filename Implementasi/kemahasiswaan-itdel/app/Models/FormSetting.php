<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSetting extends Model
{
    protected $primaryKey = 'setting_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'setting_id',
        'form_id',
        'accept_responses',
        'one_submission_per_email',
        'allow_edit',
        'open_date',
        'submission_deadline',
        'max_submissions',
        'response_notification',
        'is_active',
        'created_by',
        'updated_by',
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
