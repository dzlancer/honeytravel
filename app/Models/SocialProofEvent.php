<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialProofEvent extends Model
{
    protected $fillable = ['event_type', 'hotel_name', 'city', 'count'];

    public function scopeOfType($query, string $type)
    {
        return $query->where('event_type', $type);
    }
}
