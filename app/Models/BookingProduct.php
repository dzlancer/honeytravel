<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingProduct extends Model
{
    protected $fillable = [
        'booking_id', 'product_id', 'quantity', 'unit_price_dzd', 'total_dzd',
    ];

    protected $casts = [
        'unit_price_dzd' => 'decimal:2',
        'total_dzd' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
