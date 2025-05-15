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
        'one_submission_per_email',
        'allow_edit',
        'submission_start',
        'submission_deadline',
        'max_submissions',
        'response_notification',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'accept_responses' => 'boolean',
        'one_submission_per_email' => 'boolean',
        'allow_edit' => 'boolean',
        'is_active' => 'boolean',
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

    /**
     * Check and update form active status based on submission start and deadline
     */
    public function checkAndActivateForm()
    {
        $currentDateTime = now();
        $newActiveStatus = false; // Default to inactive

        // If both submission_start and submission_deadline are set
        if ($this->submission_start && $this->submission_deadline) {
            $newActiveStatus = $currentDateTime->between($this->submission_start, $this->submission_deadline);
        }
        // If only submission_start is set
        elseif ($this->submission_start) {
            $newActiveStatus = $currentDateTime->greaterThanOrEqualTo($this->submission_start);
        }
        // If only submission_deadline is set
        elseif ($this->submission_deadline) {
            $newActiveStatus = $currentDateTime->lessThanOrEqualTo($this->submission_deadline);
        }
        // If neither is set, use accept_responses as fallback
        else {
            $newActiveStatus = $this->accept_responses ?? false;
        }

        // Update if status has changed
        if ($newActiveStatus !== $this->is_active) {
            $this->is_active = $newActiveStatus;
            $this->save();

            // Synchronize ScholarshipForm's is_active
            $this->form()->update(['is_active' => $newActiveStatus]);
        }

        return $this->is_active;
    }
}
