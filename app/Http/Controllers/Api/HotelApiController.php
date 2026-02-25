<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HotelApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Hotel::active()->with('variants');

        if ($request->filled('district')) {
            $query->where('district', $request->district);
        }

        if ($request->filled('min_price')) {
            $query->where('sale_price_dzd', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('sale_price_dzd', '<=', $request->max_price);
        }

        if ($request->filled('stars')) {
            $query->where('star_rating', $request->stars);
        }

        $hotels = $query->orderBy('sort_order')->paginate($request->get('per_page', 20));

        return response()->json($hotels);
    }

    public function show(string $slug): JsonResponse
    {
        $hotel = Hotel::where('slug', $slug)
            ->active()
            ->with('variants')
            ->firstOrFail();

        return response()->json($hotel);
    }

    public function availability(string $slug, Request $request): JsonResponse
    {
        $request->validate([
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
        ]);

        $hotel = Hotel::where('slug', $slug)->active()->with('variants')->firstOrFail();
        $pricingService = app(PricingService::class);

        $availability = [];
        foreach ($hotel->variants as $variant) {
            $pricing = $pricingService->calculatePrice(
                $variant,
                $request->check_in,
                $request->check_out
            );

            $availability[] = [
                'variant_id' => $variant->variant_id,
                'nights' => $variant->nights,
                'available' => $hotel->available_rooms > 0,
                'available_rooms' => $hotel->available_rooms,
                'pricing' => $pricing,
            ];
        }

        return response()->json([
            'hotel' => $hotel->only(['id', 'name', 'slug', 'district', 'star_rating']),
            'availability' => $availability,
        ]);
    }

    public function b2bAvailability(Request $request): JsonResponse
    {
        $hotels = Hotel::active()
            ->with('variants')
            ->where('available_rooms', '>', 0)
            ->get()
            ->map(function ($hotel) {
                return [
                    'hotel_id' => $hotel->hotel_id,
                    'name' => $hotel->name,
                    'district' => $hotel->district,
                    'star_rating' => $hotel->star_rating,
                    'available_rooms' => $hotel->available_rooms,
                    'variants' => $hotel->variants->map(fn ($v) => [
                        'variant_id' => $v->variant_id,
                        'nights' => $v->nights,
                        'net_price_dzd' => round($v->sale_price_dzd * 0.85, 2),
                        'net_price_eur' => round($v->sale_price_eur * 0.85, 2),
                    ]),
                ];
            });

        return response()->json(['hotels' => $hotels]);
    }
}
