<div>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white overflow-hidden">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div class="max-w-3xl">
                <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    Istanbul vous attend
                </h1>
                <p class="text-xl md:text-2xl mb-8 text-amber-100">
                    62 hotels selectionnes avec prix speciaux en DZD pour les voyageurs algeriens
                </p>
                <div class="flex flex-col sm:flex-row gap-4">
                    <a href="/hotels" wire:navigate
                       class="bg-white text-amber-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-50 transition text-center shadow-lg">
                        Voir les Hotels
                    </a>
                    <a href="https://wa.me/213549591903?text=Bonjour%2C%20je%20cherche%20un%20hotel%20a%20Istanbul" target="_blank"
                       class="bg-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition text-center flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Contactez-nous
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Trust Badges -->
    <section class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div class="flex flex-col items-center gap-2">
                    <span class="text-3xl">🏨</span>
                    <span class="text-sm font-medium text-gray-600">62 Hotels Selectionnes</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                    <span class="text-3xl">💰</span>
                    <span class="text-sm font-medium text-gray-600">Prix en DZD</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                    <span class="text-3xl">📱</span>
                    <span class="text-sm font-medium text-gray-600">Support WhatsApp 24/7</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                    <span class="text-3xl">✈️</span>
                    <span class="text-sm font-medium text-gray-600">Transfert Aeroport Inclus</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Districts Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Quartiers d'Istanbul</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @foreach($districts as $district)
            <a href="/hotels?district={{ urlencode($district->district) }}" wire:navigate
               class="relative bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-6 text-white hover:shadow-lg transition group">
                <h3 class="font-semibold text-lg mb-1">{{ $district->district }}</h3>
                <p class="text-amber-100 text-sm">{{ $district->count }} hotels</p>
                <p class="text-amber-200 text-xs mt-1">A partir de {{ number_format($district->min_price, 0, ',', ' ') }} DZD</p>
                <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </div>
            </a>
            @endforeach
        </div>
    </section>

    <!-- Featured Hotels -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900">Hotels en Vedette</h2>
            <a href="/hotels" wire:navigate class="text-amber-600 hover:text-amber-700 font-medium">
                Voir tous →
            </a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($featuredHotels as $hotel)
            <a href="/hotels/{{ $hotel->slug }}" wire:navigate
               class="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group border border-gray-100">
                <div class="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 relative overflow-hidden">
                    @if($hotel->images && count($hotel->images) > 0 && $hotel->images[0])
                        <img src="{{ $hotel->images[0] }}" alt="{{ $hotel->name }}"
                             class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                             onerror="this.style.display='none'">
                    @endif
                    <div class="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                        {{ $hotel->district }}
                    </div>
                    @if($hotel->discount_percent > 0)
                    <div class="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        -{{ $hotel->discount_percent }}%
                    </div>
                    @endif
                </div>
                <div class="p-4">
                    <div class="flex items-center gap-1 mb-1">
                        @for($i = 0; $i < $hotel->star_rating; $i++)
                            <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        @endfor
                    </div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-amber-600 transition">{{ $hotel->name }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ $hotel->district }}, Istanbul</p>
                    <div class="mt-3 flex items-baseline gap-2">
                        @if($hotel->base_price_dzd > $hotel->sale_price_dzd)
                            <span class="text-sm text-gray-400 line-through">{{ number_format($hotel->base_price_dzd, 0, ',', ' ') }}</span>
                        @endif
                        <span class="text-lg font-bold text-amber-600">{{ $hotel->formatted_price }}</span>
                    </div>
                </div>
            </a>
            @endforeach
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 class="text-3xl font-bold mb-4">Besoin d'aide pour choisir?</h2>
            <p class="text-xl text-amber-100 mb-8">Nos experts voyage sont disponibles 24/7 sur WhatsApp</p>
            <a href="https://wa.me/213549591903?text=Bonjour%2C%20j'ai%20besoin%20d'aide%20pour%20choisir%20un%20hotel%20a%20Istanbul" target="_blank"
               class="inline-flex items-center gap-3 bg-white text-amber-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-50 transition shadow-lg">
                <svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Parler a un Expert
            </a>
        </div>
    </section>
</div>
