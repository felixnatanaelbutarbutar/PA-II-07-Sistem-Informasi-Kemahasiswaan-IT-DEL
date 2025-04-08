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
        'noTelephone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'requestBy');
    }
}
