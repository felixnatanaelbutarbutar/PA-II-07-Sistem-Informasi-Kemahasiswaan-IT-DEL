<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AchievementType extends Model
{
    protected $table = 'achievement_types';
    protected $primaryKey = 'type_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'type_id',
        'type_name',
        'description',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by', 'id');
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class, 'type_id', 'type_id');
    }
}
