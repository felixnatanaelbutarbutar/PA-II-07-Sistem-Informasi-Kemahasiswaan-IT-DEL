<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $table = 'announcement';
    protected $primaryKey = 'announcement_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'announcement_id',
        'title',
        'file',
        'content',
        'category_id',
        'is_active',
        'created_by',
        'updated_by'
    ];

    public function category()
    {
        return $this->belongsTo(AnnouncementCategory::class, 'category_id', 'category_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by')->select('id', 'role');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by')->select('id', 'role');
    }
}
