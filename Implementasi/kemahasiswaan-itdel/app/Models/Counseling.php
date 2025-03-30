<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Counseling extends Model
{
    use HasFactory;

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'id',
        'requestBy',
        'issue',
        'noTelephone',
        'status',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                // Find the latest counseling record to determine the next ID
                $latest = static::orderBy('id', 'desc')->first();
                $nextNumber = $latest ? (int) substr($latest->id, 3) + 1 : 1;
                $model->id = 'csl' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT); // e.g., csl001
            }
        });
    }

    /**
     * Get the user that requested the counseling.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'requestBy');
    }
}