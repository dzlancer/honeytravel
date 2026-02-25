<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'reference', 'customer_id', 'hotel_id', 'variant_id',
        'check_in', 'check_out', 'nights', 'guests', 'rooms',
        'status', 'payment_status', 'payment_method',
        'total_dzd', 'total_eur', 'paid_amount_dzd',
        'price_breakdown', 'guest_details', 'channel',
        'cancellation_reason', 'internal_notes',
        'fbp', 'fbc', 'event_source_url',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'price_breakdown' => 'array',
        'guest_details' => 'array',
        'total_dzd' => 'decimal:2',
        'total_eur' => 'decimal:2',
        'paid_amount_dzd' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['status', 'payment_status', 'total_dzd'])->logOnlyDirty();
    }

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            if (empty($booking->reference)) {
                $booking->reference = 'BK-' . strtoupper(Str::random(6));
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(HotelVariant::class, 'variant_id');
    }

    public function paymentEvents(): HasMany
    {
        return $this->hasMany(PaymentEvent::class)->orderBy('created_at', 'desc');
    }

    public function whatsappLogs(): HasMany
    {
        return $this->hasMany(WhatsappLog::class)->orderBy('created_at', 'desc');
    }

    public function bookingProducts(): HasMany
    {
        return $this->hasMany(BookingProduct::class);
    }

    // Scopes
    public function scopePending($query) { return $query->where('status', 'pending'); }
    public function scopeConfirmed($query) { return $query->where('status', 'confirmed'); }
    public function scopeCancelled($query) { return $query->where('status', 'cancelled'); }

    public function getFormattedTotalAttribute(): string
    {
        return number_format($this->total_dzd, 0, ',', ' ') . ' DZD';
    }

    public function getRemainingAttribute(): float
    {
        return max(0, $this->total_dzd - $this->paid_amount_dzd);
    }
}
