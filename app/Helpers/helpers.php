<?php

if (!function_exists('toDzd')) {
    function toDzd(float $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' DZD';
    }
}

if (!function_exists('toEur')) {
    function toEur(float $dzd): float
    {
        return round($dzd * 0.0067, 2);
    }
}

if (!function_exists('formatEur')) {
    function formatEur(float $amount): string
    {
        return number_format($amount, 2, ',', ' ') . ' €';
    }
}

if (!function_exists('generateBookingRef')) {
    function generateBookingRef(): string
    {
        return 'BK-' . strtoupper(\Illuminate\Support\Str::random(6));
    }
}

if (!function_exists('validateAlgerianPhone')) {
    function validateAlgerianPhone(string $phone): bool
    {
        return (bool) preg_match('/^\+213[5-7]\d{8}$/', preg_replace('/\s+/', '', $phone));
    }
}
