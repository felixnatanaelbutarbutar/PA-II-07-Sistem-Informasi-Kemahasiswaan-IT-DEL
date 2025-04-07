<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasFactory;

    protected $table = 'news';
    protected $primaryKey = 'news_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'news_id',
        'title',
        'image',
        'content',
        'category_id',
        'created_by',
        'updated_by'
    ];

    public function category()
    {
        return $this->belongsTo(NewsCategory::class, 'category_id', 'category_id');
    }
    public function getRouteKeyName()
    {
        return 'news_id';
    }
}
