<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type', 'title', 'title_fr', 'description', 'description_fr',
        'price_dzd', 'price_eur', 'cost_dzd',
        'duration', 'supplier_name', 'supplier_contact', 'supplier_commission',
        'metadata', 'is_active',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'price_dzd' => 'decimal:2',
        'price_eur' => 'decimal:2',
        'cost_dzd' => 'decimal:2',
        'supplier_commission' => 'decimal:2',
    ];

    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopeOfType($query, string $type) { return $query->where('type', $type); }

    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price_dzd, 0, ',', ' ') . ' DZD';
    }
}
