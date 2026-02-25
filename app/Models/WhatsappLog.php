<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappLog extends Model
{
    protected $fillable = [
        'booking_id', 'customer_id', 'direction', 'message_type',
        'content', 'template_name', 'status', 'whatsapp_message_id', 'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
