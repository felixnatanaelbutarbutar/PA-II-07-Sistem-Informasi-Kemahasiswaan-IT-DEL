<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aspiration extends Model
{
    use HasFactory;

    protected $fillable = [
        'requestBy',
        'story',
        'category_id',
        'image',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'requestBy');
    }

    public function category()
    {
        return $this->belongsTo(AspirationCategory::class, 'category_id');
    }
}
