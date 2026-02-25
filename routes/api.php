<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HotelApiController;
use App\Http\Controllers\Api\BookingApiController;

// Public API endpoints
Route::prefix('hotels')->group(function () {
    Route::get('/', [HotelApiController::class, 'index']);
    Route::get('/{slug}', [HotelApiController::class, 'show']);
    Route::get('/{slug}/availability', [HotelApiController::class, 'availability']);
});

Route::post('/bookings', [BookingApiController::class, 'store']);

// B2B API (requires API key)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/b2b/availability', [HotelApiController::class, 'b2bAvailability']);
});
