<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Counseling extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'requestBy',
        'issue',
        'noWhatsApp',
        'booking_date',
        'booking_time',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'requestBy');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $latest = static::orderBy('created_at', 'desc')->first();
                $newId = $latest ? ((int) str_replace('csl', '', $latest->id) + 1) : 1;
                $model->id = 'csl' . str_pad($newId, 3, '0', STR_PAD_LEFT);
            }
        });
    }
}