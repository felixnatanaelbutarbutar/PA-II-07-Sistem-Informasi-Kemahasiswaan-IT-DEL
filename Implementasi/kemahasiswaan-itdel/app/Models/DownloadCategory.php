<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DownloadCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'created_by', 'updated_by'];

    /**
     * Relasi ke model Download (one-to-many).
     */
    public function downloads()
    {
        return $this->hasMany(Download::class, 'category_id');
    }

    /**
     * Relasi ke pengguna yang membuat kategori.
     */
    public function created_by()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi ke pengguna yang memperbarui kategori.
     */
    public function updated_by()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}