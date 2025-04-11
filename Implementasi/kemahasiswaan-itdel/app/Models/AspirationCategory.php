<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AspirationCategory extends Model
{
    use HasFactory;

    protected $table = 'aspiration_categories'; // Tentukan nama tabel secara eksplisit

    protected $fillable = ['name'];

    public function aspirations()
    {
        return $this->hasMany(Aspiration::class, 'category_id');
    }
}
