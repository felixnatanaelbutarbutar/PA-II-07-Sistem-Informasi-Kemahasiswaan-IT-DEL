<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aspiration extends Model
{
    protected $fillable = [
        'mpm_id',
        'story',
        'category_id',
        'image',
    ];

    public function mpm()
    {
        return $this->belongsTo(Mpm::class, 'mpm_id');
    }

    public function category()
    {
        return $this->belongsTo(AspirationCategory::class, 'category_id');
    }
}