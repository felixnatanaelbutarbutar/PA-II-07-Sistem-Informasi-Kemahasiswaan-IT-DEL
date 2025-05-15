<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Download extends Model
{
    protected $fillable = ['title', 'description', 'file_path', 'category_id', 'created_by', 'updated_by'];

    public function category()
    {
        return $this->belongsTo(DownloadCategory::class, 'category_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}