<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementCategory extends Model
{
    use HasFactory;

    protected $table = 'announcement_categories';
    protected $primaryKey = 'category_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'category_id',
        'category_name',
        'description',
        'created_by',
        'updated_by'
    ];

    public function announcement()
    {
        return $this->hasMany(News::class, 'category_id');
    }
}
