<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    use HasFactory;

    protected $table = 'achievements';
    protected $primaryKey = 'achievement_id';
    public $incrementing = false; // Non-incrementing since it's a string
    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'description',
        'category',
        'achievement_type_id', // Updated to match migration
        'rank',
        'medal',
        'event_name',
        'event_date',
        'created_by',
        'updated_by',
    ];

    // Relationship with AchievementType
    public function achievementType()
    {
        return $this->belongsTo(AchievementType::class, 'achievement_type_id', 'type_id');
    }

    // Daftar kategori enum
    const CATEGORIES = ['International', 'National', 'Regional'];

    // Auto-generate achievement_id
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->achievement_id)) {
                $model->achievement_id = $model->generateAchievementId();
            }
        });
    }

    private function generateAchievementId()
    {
        $lastAchievement = self::latest('achievement_id')->first();

        if ($lastAchievement) {
            $lastNumber = (int) substr($lastAchievement->achievement_id, 4); // Extract number after 'achv'
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return 'achv' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }
}