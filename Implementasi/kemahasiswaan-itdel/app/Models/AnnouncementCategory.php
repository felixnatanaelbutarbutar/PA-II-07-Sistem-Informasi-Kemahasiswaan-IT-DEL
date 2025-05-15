<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnouncementCategory extends Model
{
    protected $table = 'announcement_categories';
    protected $primaryKey = 'category_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'category_id',
        'category_name',
        'description',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_by' => 'integer', // Cast ke integer karena tipe data sekarang bigint
        'updated_by' => 'integer', // Cast ke integer karena tipe data sekarang bigint
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by', 'id');
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class, 'category_id', 'category_id');
    }
}
