<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Str;

class Hotel extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'hotel_id', 'name', 'slug', 'description', 'description_fr', 'description_ar',
        'star_rating', 'address', 'district', 'city', 'country',
        'latitude', 'longitude',
        'base_price_dzd', 'sale_price_dzd', 'base_price_eur', 'sale_price_eur',
        'amenities', 'images', 'seo_meta',
        'contact_phone', 'contact_email',
        'total_rooms', 'available_rooms',
        'is_active', 'is_featured', 'sort_order',
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'seo_meta' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'base_price_dzd' => 'decimal:2',
        'sale_price_dzd' => 'decimal:2',
        'base_price_eur' => 'decimal:2',
        'sale_price_eur' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'sale_price_dzd', 'is_active', 'district', 'star_rating'])
            ->logOnlyDirty();
    }

    protected static function booted(): void
    {
        static::creating(function (Hotel $hotel) {
            if (empty($hotel->slug)) {
                $hotel->slug = Str::slug($hotel->name);
            }
        });
    }

    public function variants(): HasMany
    {
        return $this->hasMany(HotelVariant::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('gallery')
            ->useFallbackUrl('/images/hotel-placeholder.jpg');

        $this->addMediaCollection('thumbnail')
            ->singleFile()
            ->useFallbackUrl('/images/hotel-placeholder.jpg');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByDistrict($query, string $district)
    {
        return $query->where('district', $district);
    }

    public function scopeByStars($query, int $stars)
    {
        return $query->where('star_rating', $stars);
    }

    public function scopePriceRange($query, float $min, float $max)
    {
        return $query->whereBetween('sale_price_dzd', [$min, $max]);
    }

    // Helpers
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->sale_price_dzd, 0, ',', ' ') . ' DZD';
    }

    public function getDiscountPercentAttribute(): int
    {
        if ($this->base_price_dzd <= 0) return 0;
        return (int) round((1 - $this->sale_price_dzd / $this->base_price_dzd) * 100);
    }
}
