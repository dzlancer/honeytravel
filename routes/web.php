<?php

use Illuminate\Support\Facades\Route;
use App\Livewire\HomePage;
use App\Livewire\HotelList;
use App\Livewire\HotelDetail;
use App\Livewire\BookingWizard;

// Frontend Routes
Route::get('/', HomePage::class)->name('home');
Route::get('/hotels', HotelList::class)->name('hotels.index');
Route::get('/hotels/{slug}', HotelDetail::class)->name('hotels.show');
Route::get('/booking/{variantId}', BookingWizard::class)->name('booking.wizard');

// Booking confirmation
Route::get('/booking/confirmation/{ref}', function (string $ref) {
    $booking = \App\Models\Booking::where('reference', $ref)->with(['hotel', 'customer', 'variant'])->firstOrFail();
    return view('pages.booking-confirmation', compact('booking'));
})->name('booking.confirmation');

// Webhook routes
Route::post('/webhooks/whatsapp', [\App\Http\Controllers\WebhookController::class, 'whatsapp'])->name('webhooks.whatsapp');
Route::post('/webhooks/d17/confirmation', [\App\Http\Controllers\WebhookController::class, 'd17Confirmation'])->name('webhooks.d17');
