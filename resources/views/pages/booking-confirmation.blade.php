@extends('layouts.app')

@section('title', 'Confirmation - ' . $booking->reference)

@section('content')
<div class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12">
    <div class="max-w-2xl mx-auto px-4">
        <!-- Success Header -->
        <div class="text-center mb-8">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900">Reservation Confirmee!</h1>
            <p class="text-gray-600 mt-2">Reference: <span class="font-mono font-bold text-amber-600">{{ $booking->reference }}</span></p>
        </div>

        <!-- Booking Details Card -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Details de la Reservation</h2>

            <div class="space-y-4">
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-gray-600">Hotel</span>
                    <span class="font-semibold">{{ $booking->hotel->name ?? 'N/A' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-gray-600">District</span>
                    <span>{{ $booking->hotel->district ?? 'N/A' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-gray-600">Check-in</span>
                    <span>{{ $booking->check_in ? $booking->check_in->format('d/m/Y') : 'N/A' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-gray-600">Check-out</span>
                    <span>{{ $booking->check_out ? $booking->check_out->format('d/m/Y') : 'N/A' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-gray-600">Nuits</span>
                    <span>{{ $booking->nights }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-gray-600">Chambres</span>
                    <span>{{ $booking->rooms }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-gray-600">Voyageurs</span>
                    <span>{{ $booking->guests }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-gray-600">Paiement</span>
                    <span class="capitalize">{{ $booking->payment_method }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-gray-600">Statut</span>
                    <span class="px-3 py-1 rounded-full text-sm font-medium
                        @if($booking->status === 'confirmed') bg-green-100 text-green-800
                        @elseif($booking->status === 'pending') bg-yellow-100 text-yellow-800
                        @else bg-gray-100 text-gray-800 @endif">
                        {{ ucfirst($booking->status) }}
                    </span>
                </div>
            </div>

            <!-- Price -->
            <div class="mt-6 pt-4 border-t-2 border-amber-200">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold text-gray-900">Total</span>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-amber-600">{{ number_format($booking->total_dzd, 0, ',', ' ') }} DZD</p>
                        <p class="text-sm text-gray-500">{{ number_format($booking->total_eur, 0, ',', ' ') }} EUR</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Guest Details -->
        @if($booking->customer)
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Informations du Voyageur</h2>
            <div class="space-y-3">
                <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Nom</span>
                    <span class="font-semibold">{{ $booking->customer->full_name }}</span>
                </div>
                @if($booking->customer->email)
                <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">Email</span>
                    <span>{{ $booking->customer->email }}</span>
                </div>
                @endif
                <div class="flex justify-between py-2 border-b">
                    <span class="text-gray-600">WhatsApp</span>
                    <span>{{ $booking->customer->whatsapp }}</span>
                </div>
            </div>
        </div>
        @endif

        <!-- WhatsApp CTA -->
        <div class="text-center space-y-4">
            <a href="https://wa.me/213549591903?text=Bonjour%2C%20ma%20reservation%20{{ $booking->reference }}"
               class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg shadow-green-500/25"
               target="_blank">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Confirmer sur WhatsApp
            </a>

            <p class="text-gray-500 text-sm">
                Notre equipe vous contactera sous 30 minutes pour confirmer votre reservation.
            </p>

            <a href="{{ route('home') }}" class="inline-block text-amber-600 hover:text-amber-700 font-medium">
                ← Retour a l'accueil
            </a>
        </div>
    </div>
</div>
@endsection
