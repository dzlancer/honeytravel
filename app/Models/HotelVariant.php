<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelVariant extends Model
{
    protected $fillable = [
        'hotel_id', 'variant_id', 'nights',
        'base_price_dzd', 'sale_price_dzd', 'base_price_eur', 'sale_price_eur',
        'pricing_rules', 'is_active',
    ];

    protected $casts = [
        'pricing_rules' => 'array',
        'is_active' => 'boolean',
        'base_price_dzd' => 'decimal:2',
        'sale_price_dzd' => 'decimal:2',
    ];

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->sale_price_dzd, 0, ',', ' ') . ' DZD';
    }

    public function getNightLabelAttribute(): string
    {
        return $this->nights . 'N/' . ($this->nights + 1) . 'J';
    }
}
