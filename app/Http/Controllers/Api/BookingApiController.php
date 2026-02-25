<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\HotelVariant;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingApiController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'variant_id' => 'required|exists:hotel_variants,id',
            'full_name' => 'required|string|min:3|max:255',
            'phone' => 'required|string|min:10',
            'whatsapp' => 'required|string|min:10',
            'email' => 'nullable|email',
            'city' => 'nullable|string',
            'check_in' => 'required|date|after:today',
            'check_out' => 'required|date|after:check_in',
            'rooms' => 'integer|min:1|max:10',
            'guests' => 'integer|min:1|max:20',
            'payment_method' => 'required|in:cib,baridimob,cash,reserve',
            'channel' => 'nullable|string',
        ]);

        $variant = HotelVariant::with('hotel')->findOrFail($validated['variant_id']);
        $hotel = $variant->hotel;

        // Calculate pricing
        $pricingService = app(PricingService::class);
        $rooms = $validated['rooms'] ?? 1;
        $pricing = $pricingService->calculatePrice($variant, $validated['check_in'], $validated['check_out'], $validated['channel'] ?? 'website', null, $rooms);

        // Create or find customer
        $customer = Customer::firstOrCreate(
            ['whatsapp' => $validated['whatsapp']],
            [
                'full_name' => $validated['full_name'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'],
                'city' => $validated['city'] ?? null,
                'country' => 'Algeria',
                'acquisition_channel' => $validated['channel'] ?? 'api',
            ]
        );

        // Create booking
        $booking = Booking::create([
            'reference' => 'BK-' . strtoupper(Str::random(6)),
            'customer_id' => $customer->id,
            'hotel_id' => $hotel->id,
            'variant_id' => $variant->id,
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'nights' => $variant->nights,
            'guests' => $validated['guests'] ?? 2,
            'rooms' => $rooms,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'payment_method' => $validated['payment_method'],
            'total_dzd' => $pricing['honey_price_dzd'] * $rooms,
            'total_eur' => $pricing['honey_price_eur'] * $rooms,
            'price_breakdown' => $pricing,
            'channel' => $validated['channel'] ?? 'api',
            'fbp' => $request->header('X-Fbp'),
            'fbc' => $request->header('X-Fbc'),
        ]);

        return response()->json([
            'success' => true,
            'booking' => [
                'reference' => $booking->reference,
                'hotel' => $hotel->name,
                'variant' => $variant->variant_id,
                'check_in' => $booking->check_in->format('Y-m-d'),
                'check_out' => $booking->check_out->format('Y-m-d'),
                'total_dzd' => $booking->total_dzd,
                'total_eur' => $booking->total_eur,
                'status' => $booking->status,
                'whatsapp_link' => 'https://wa.me/213549591903?text=Ref:' . $booking->reference,
            ],
        ], 201);
    }
}
