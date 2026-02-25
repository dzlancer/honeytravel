<?php

namespace App\Services;

use App\Models\HotelVariant;
use App\Models\Season;
use App\Models\Customer;
use App\Models\Hotel;
use Illuminate\Support\Facades\Cache;

class PricingService
{
    /**
     * Calculate dynamic price for a variant.
     */
    public function calculatePrice(
        HotelVariant $variant,
        ?string $checkIn = null,
        ?string $checkOut = null,
        string $channel = 'website',
        ?int $customerId = null,
        int $rooms = 1
    ): array {
        $basePrice = (float) $variant->base_price_dzd;
        $factors = [];
        $multiplier = 1.0;

        // 1. Seasonality factor
        if ($checkIn) {
            $season = Season::active()->forDate($checkIn)->first();
            if ($season) {
                $multiplier *= (float) $season->multiplier;
                $factors['seasonality'] = [
                    'name' => $season->name,
                    'multiplier' => (float) $season->multiplier,
                ];
            }
        }

        // 2. Demand multiplier (Redis counter-based)
        $demandKey = 'demand:' . $variant->hotel_id;
        $viewCount = (int) Cache::get($demandKey, 0);
        if ($viewCount > 50) {
            $demandMultiplier = 1.10;
            $multiplier *= $demandMultiplier;
            $factors['demand'] = ['views' => $viewCount, 'multiplier' => $demandMultiplier];
        } elseif ($viewCount > 20) {
            $demandMultiplier = 1.05;
            $multiplier *= $demandMultiplier;
            $factors['demand'] = ['views' => $viewCount, 'multiplier' => $demandMultiplier];
        }

        // 3. Scarcity factor
        $hotel = $variant->hotel;
        if ($hotel && $hotel->available_rooms < 5) {
            $scarcityMultiplier = 1.15;
            $multiplier *= $scarcityMultiplier;
            $factors['scarcity'] = [
                'available_rooms' => $hotel->available_rooms,
                'multiplier' => $scarcityMultiplier,
            ];
        }

        // 4. Channel discount
        $channelDiscount = 0;
        if ($channel === 'tiktok') {
            $channelDiscount = 0.05;
            $factors['channel'] = ['name' => 'TikTok', 'discount' => '5%'];
        } elseif ($channel === 'instagram') {
            $channelDiscount = 0.03;
            $factors['channel'] = ['name' => 'Instagram', 'discount' => '3%'];
        }

        // 5. Loyalty discount (returning customers)
        $loyaltyDiscount = 0;
        if ($customerId) {
            $customer = Customer::find($customerId);
            if ($customer && $customer->booking_count > 0) {
                $loyaltyDiscount = 0.10;
                $factors['loyalty'] = ['bookings' => $customer->booking_count, 'discount' => '10%'];
            }
        }

        // 6. Group discount (5+ rooms)
        $groupDiscount = 0;
        if ($rooms >= 5) {
            $groupDiscount = 0.08;
            $factors['group'] = ['rooms' => $rooms, 'discount' => '8%'];
        }

        // Calculate final price
        $adjustedPrice = $basePrice * $multiplier;
        $totalDiscount = $channelDiscount + $loyaltyDiscount + $groupDiscount;
        $finalPrice = $adjustedPrice * (1 - $totalDiscount);
        $finalPrice = round($finalPrice, 2);

        // Ensure final price doesn't go below sale price (minimum floor)
        $salePrice = (float) $variant->sale_price_dzd;
        $honeyPrice = max($salePrice, $finalPrice);

        // Calculate savings
        $savings = max(0, $basePrice - $honeyPrice);
        $savingsPercent = $basePrice > 0 ? round(($savings / $basePrice) * 100) : 0;

        return [
            'base_price_dzd' => $basePrice,
            'honey_price_dzd' => $honeyPrice,
            'base_price_eur' => round($basePrice * 0.0067, 2),
            'honey_price_eur' => round($honeyPrice * 0.0067, 2),
            'savings_dzd' => $savings,
            'savings_percent' => $savingsPercent,
            'multiplier' => round($multiplier, 4),
            'total_discount' => round($totalDiscount * 100, 1),
            'factors' => $factors,
            'per_night_dzd' => $variant->nights > 0 ? round($honeyPrice / $variant->nights, 2) : $honeyPrice,
        ];
    }

    /**
     * Format price with DZD Algerian separators.
     */
    public static function formatDzd(float $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' DZD';
    }

    /**
     * Convert DZD to EUR.
     */
    public static function toEur(float $dzd): float
    {
        return round($dzd * 0.0067, 2);
    }

    /**
     * Increment demand counter for a hotel.
     */
    public function incrementDemand(int $hotelId): void
    {
        $key = 'demand:' . $hotelId;
        Cache::increment($key);
        // Set TTL to 1 hour if new key
        if (Cache::get($key) <= 1) {
            Cache::put($key, 1, 3600);
        }
    }
}
