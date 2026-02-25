<div>
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <a href="/" wire:navigate class="hover:text-amber-600">Accueil</a>
            <span>/</span>
            <a href="/hotels" wire:navigate class="hover:text-amber-600">Hotels</a>
            <span>/</span>
            <span class="text-gray-900">{{ $hotel->name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2">
                <!-- Image Gallery -->
                <div class="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl overflow-hidden relative mb-6">
                    @if($hotel->images && count($hotel->images) > 0 && $hotel->images[0])
                        <img src="{{ $hotel->images[0] }}" alt="{{ $hotel->name }}"
                             class="w-full h-full object-cover" onerror="this.style.display='none'">
                    @endif
                    <div class="absolute top-4 left-4 flex gap-2">
                        <span class="bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">{{ $hotel->district }}</span>
                        @if($hotel->discount_percent > 0)
                            <span class="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">-{{ $hotel->discount_percent }}%</span>
                        @endif
                    </div>
                </div>

                <!-- Hotel Info -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <div class="flex items-center gap-1 mb-2">
                                @for($i = 0; $i < $hotel->star_rating; $i++)
                                    <svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                @endfor
                            </div>
                            <h1 class="text-3xl font-bold text-gray-900">{{ $hotel->name }}</h1>
                            <p class="text-gray-500 mt-1">{{ $hotel->address }}, {{ $hotel->district }}, Istanbul</p>
                        </div>
                    </div>

                    <!-- Social Proof -->
                    <div class="flex flex-wrap gap-3 mb-6">
                        <span class="inline-flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                            🔥 {{ $bookingsToday }} Algeriens ont reserve aujourd'hui
                        </span>
                        <span class="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                            👁 {{ $viewers }} personnes consultent cette page
                        </span>
                        @if($hotel->available_rooms < 5)
                        <span class="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                            ⚡ Plus que {{ $hotel->available_rooms }} chambres!
                        </span>
                        @endif
                    </div>

                    <!-- Description -->
                    <div class="prose max-w-none text-gray-700">
                        {!! $hotel->description_fr ?: $hotel->description !!}
                    </div>
                </div>

                <!-- Amenities -->
                @if($hotel->amenities && count($hotel->amenities) > 0)
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Equipements</h2>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        @foreach($hotel->amenities as $amenity)
                            <div class="flex items-center gap-2 text-gray-600">
                                <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                <span class="text-sm">{{ $amenity }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>
                @endif

                <!-- Location -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Localisation</h2>
                    <p class="text-gray-600 mb-4">{{ $hotel->address }}, {{ $hotel->district }}, {{ $hotel->city }}, {{ $hotel->country }}</p>
                    <div id="hotel-map" class="h-64 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        <span>Carte - {{ $hotel->latitude }}, {{ $hotel->longitude }}</span>
                    </div>
                </div>
            </div>

            <!-- Sidebar - Booking Card -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                    <h2 class="text-xl font-semibold text-gray-900 mb-4">Choisir votre formule</h2>

                    <!-- Variant Selection -->
                    <div class="space-y-3 mb-6">
                        @foreach($hotel->variants as $variant)
                            @php $price = $variantPrices[$variant->id] ?? null; @endphp
                            <button wire:click="selectVariant({{ $variant->id }})"
                                    class="w-full text-left p-4 rounded-lg border-2 transition {{ $selectedVariantId === $variant->id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300' }}">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <span class="font-semibold text-gray-900">{{ $variant->night_label }}</span>
                                        <p class="text-xs text-gray-500 mt-0.5">{{ $variant->variant_id }}</p>
                                    </div>
                                    <div class="text-right">
                                        @if($price)
                                            @if($price['base_price_dzd'] > $price['honey_price_dzd'])
                                                <span class="text-xs text-gray-400 line-through block">{{ number_format($price['base_price_dzd'], 0, ',', ' ') }} DZD</span>
                                            @endif
                                            <span class="font-bold text-amber-600">{{ number_format($price['honey_price_dzd'], 0, ',', ' ') }} DZD</span>
                                            @if($price['savings_percent'] > 0)
                                                <span class="text-xs text-green-600 block">Economisez {{ $price['savings_percent'] }}%</span>
                                            @endif
                                        @else
                                            <span class="font-bold text-amber-600">{{ $variant->formatted_price }}</span>
                                        @endif
                                    </div>
                                </div>
                            </button>
                        @endforeach
                    </div>

                    <!-- Price Summary -->
                    @if($selectedVariantId)
                        @php $selectedPrice = $variantPrices[$selectedVariantId] ?? null; @endphp
                        @if($selectedPrice)
                        <div class="bg-amber-50 rounded-lg p-4 mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-gray-600">Prix Honey Special</span>
                                <span class="text-2xl font-bold text-amber-600">{{ number_format($selectedPrice['honey_price_dzd'], 0, ',', ' ') }} DZD</span>
                            </div>
                            <div class="text-xs text-gray-500">
                                ≈ {{ number_format($selectedPrice['honey_price_eur'], 2) }} EUR |
                                {{ number_format($selectedPrice['per_night_dzd'], 0, ',', ' ') }} DZD/nuit
                            </div>
                            @if(count($selectedPrice['factors']) > 0)
                            <div class="mt-2 pt-2 border-t border-amber-200">
                                @foreach($selectedPrice['factors'] as $name => $factor)
                                    <div class="text-xs text-gray-500 flex justify-between">
                                        <span>{{ ucfirst($name) }}</span>
                                        <span>{{ is_array($factor) ? ($factor['multiplier'] ?? ($factor['discount'] ?? '')) : $factor }}</span>
                                    </div>
                                @endforeach
                            </div>
                            @endif
                        </div>
                        @endif
                    @endif

                    <!-- CTA Buttons -->
                    @if($selectedVariantId)
                    <a href="/booking/{{ $selectedVariantId }}" wire:navigate
                       class="block w-full bg-amber-500 text-white text-center py-4 rounded-xl font-semibold text-lg hover:bg-amber-600 transition mb-3">
                        Reserver Maintenant
                    </a>
                    @endif

                    <a href="https://wa.me/213549591903?text=Bonjour%2C%20je%20suis%20interesse%20par%20{{ urlencode($hotel->name) }}" target="_blank"
                       class="block w-full bg-green-500 text-white text-center py-3 rounded-xl font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Demander sur WhatsApp
                    </a>

                    <!-- Trust signals -->
                    <div class="mt-4 space-y-2 text-sm text-gray-500">
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            Confirmation instantanee
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            Annulation gratuite 48h avant
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            Paiement en DZD
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
