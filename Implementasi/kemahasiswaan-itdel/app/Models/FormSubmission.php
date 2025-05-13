<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'form_submissions';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'submission_id';

    /**
     * Indicates if the primary key is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the primary key.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'submission_id',
        'form_id',
        'user_id',
        'data',
        'personal_data',
        'submitted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'data' => 'array',
        'personal_data' => 'array',
        'submitted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that submitted the form.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the scholarship form associated with the submission.
     */
    public function form()
    {
        return $this->belongsTo(ScholarshipForm::class, 'form_id');
    }

    /**
     * Get a specific field value from the data JSON column.
     *
     * @param string $fieldId
     * @return mixed
     */
    public function getFieldValue($fieldId)
    {
        return $this->data[$fieldId] ?? null;
    }

    /**
     * Get a specific personal data value from the personal_data JSON column.
     *
     * @param string $key
     * @return mixed
     */
    public function getPersonalDataValue($key)
    {
        return $this->personal_data[$key] ?? null;
    }
}
