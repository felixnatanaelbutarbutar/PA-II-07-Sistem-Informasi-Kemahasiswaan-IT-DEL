<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AchievementType extends Model
{
    use HasFactory;

    protected $table = 'achievement_types';
    protected $primaryKey = 'type_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'type_name',
        'description',
        'created_by',
        'updated_by',
    ];

    protected static function boot()
    {
        parent::boot();

        // Event saat membuat record baru
        static::creating(function ($model) {
            $model->type_id = self::generateTypeId();
        });
    }

    // Generate ID otomatis "type001", "type002", "type003", ...
    public static function generateTypeId()
    {
        $lastType = self::latest('type_id')->first();

        if ($lastType) {
            $lastNumber = (int) substr($lastType->type_id, 4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return 'type' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class, 'achievement_type', 'type_id');
    }
}
