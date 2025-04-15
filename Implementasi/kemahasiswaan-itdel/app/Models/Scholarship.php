<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scholarship extends Model
{
    use HasFactory;

    protected $table = 'scholarships';
    protected $primaryKey = 'scholarship_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'scholarship_id',
        'name',
        'description',
        'poster',
        'start_date',
        'end_date',
        'category_id',
        'created_by',
        'updated_by',
    ];

    // Default poster URL
    const DEFAULT_POSTER = '/images/default-scholarship-poster.jpg'; // Ganti dengan path atau URL gambar default Anda

    // Accessor untuk kolom poster
    public function getPosterAttribute($value)
    {
        return $value ?: self::DEFAULT_POSTER;
    }

    // Relasi ke ScholarshipCategory
    public function category()
    {
        return $this->belongsTo(ScholarshipCategory::class, 'category_id', 'category_id');
    }

    // Relasi ke user (created_by)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    // Relasi ke user (updated_by)
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by', 'id');
    }

    public function getRouteKeyName()
    {
        return 'scholarship_id';
    }

    protected $dates = [
        'start_date',
        'end_date',
        'created_at',
        'updated_at',
    ];
}
