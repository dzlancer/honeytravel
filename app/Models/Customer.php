<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Customer extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'full_name', 'email', 'phone', 'whatsapp', 'city', 'country',
        'passport_number', 'psid', 'igid', 'preferences', 'tags',
        'is_vip', 'loyalty_points', 'referral_code', 'referred_by',
        'acquisition_channel',
    ];

    protected $casts = [
        'preferences' => 'array',
        'tags' => 'array',
        'is_vip' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['full_name', 'is_vip', 'tags'])->logOnlyDirty();
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function whatsappLogs(): HasMany
    {
        return $this->hasMany(WhatsappLog::class);
    }

    public function getTotalSpendAttribute(): float
    {
        return $this->bookings()->where('status', '!=', 'cancelled')->sum('total_dzd');
    }

    public function getBookingCountAttribute(): int
    {
        return $this->bookings()->count();
    }

    public function getAovAttribute(): float
    {
        $count = $this->booking_count;
        return $count > 0 ? $this->total_spend / $count : 0;
    }
}
