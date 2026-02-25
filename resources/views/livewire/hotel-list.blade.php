<div>
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Hotels a Istanbul</h1>

        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div class="md:col-span-2">
                    <input wire:model.live.debounce.300ms="search" type="text" placeholder="Rechercher un hotel..."
                           class="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500">
                </div>
                <div>
                    <select wire:model.live="district" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500">
                        <option value="">Tous les quartiers</option>
                        @foreach($districts as $name => $count)
                            <option value="{{ $name }}">{{ $name }} ({{ $count }})</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <select wire:model.live="stars" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500">
                        <option value="">Toutes les etoiles</option>
                        <option value="5">5 Etoiles</option>
                        <option value="4">4 Etoiles</option>
                        <option value="3">3 Etoiles</option>
                        <option value="2">2 Etoiles</option>
                    </select>
                </div>
                <div>
                    <select wire:model.live="sortBy" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500">
                        <option value="sale_price_dzd">Prix croissant</option>
                        <option value="star_rating">Etoiles</option>
                        <option value="name">Nom A-Z</option>
                    </select>
                </div>
            </div>
            @if($search || $district || $stars)
            <div class="mt-3 flex items-center gap-2">
                <span class="text-sm text-gray-500">Filtres actifs:</span>
                @if($search)
                    <span class="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs">
                        "{{ $search }}" <button wire:click="$set('search', '')" class="ml-1">&times;</button>
                    </span>
                @endif
                @if($district)
                    <span class="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs">
                        {{ $district }} <button wire:click="$set('district', '')" class="ml-1">&times;</button>
                    </span>
                @endif
                @if($stars)
                    <span class="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs">
                        {{ $stars }} etoiles <button wire:click="$set('stars', '')" class="ml-1">&times;</button>
                    </span>
                @endif
                <button wire:click="clearFilters" class="text-xs text-red-500 hover:text-red-700">Effacer tout</button>
            </div>
            @endif
        </div>

        <!-- Results count -->
        <p class="text-gray-500 mb-4">{{ $hotels->total() }} hotels trouves</p>

        <!-- Hotel Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @forelse($hotels as $hotel)
            <a href="/hotels/{{ $hotel->slug }}" wire:navigate
               class="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group border border-gray-100">
                <div class="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 relative overflow-hidden">
                    @if($hotel->images && count($hotel->images) > 0 && $hotel->images[0])
                        <img src="{{ $hotel->images[0] }}" alt="{{ $hotel->name }}"
                             class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                             loading="lazy" onerror="this.style.display='none'">
                    @endif
                    <div class="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                        {{ $hotel->district }}
                    </div>
                    @if($hotel->discount_percent > 0)
                    <div class="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        -{{ $hotel->discount_percent }}%
                    </div>
                    @endif
                    @if($hotel->available_rooms < 5)
                    <div class="absolute bottom-3 left-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-semibold animate-pulse">
                        Plus que {{ $hotel->available_rooms }} chambres!
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
                    <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ Str::limit(strip_tags($hotel->description_fr ?: $hotel->description), 100) }}</p>

                    @if($hotel->amenities)
                    <div class="flex flex-wrap gap-1 mt-2">
                        @foreach(array_slice($hotel->amenities, 0, 3) as $amenity)
                            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{{ $amenity }}</span>
                        @endforeach
                    </div>
                    @endif

                    <div class="mt-3 flex items-baseline gap-2">
                        @if($hotel->base_price_dzd > $hotel->sale_price_dzd)
                            <span class="text-sm text-gray-400 line-through">{{ number_format($hotel->base_price_dzd, 0, ',', ' ') }}</span>
                        @endif
                        <span class="text-lg font-bold text-amber-600">{{ $hotel->formatted_price }}</span>
                    </div>

                    @if($hotel->variants->count() > 0)
                    <div class="flex gap-2 mt-2">
                        @foreach($hotel->variants as $variant)
                            <span class="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                                {{ $variant->night_label }}
                            </span>
                        @endforeach
                    </div>
                    @endif
                </div>
            </a>
            @empty
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500 text-lg">Aucun hotel trouve pour ces criteres.</p>
                <button wire:click="clearFilters" class="mt-4 text-amber-600 hover:text-amber-700 font-medium">
                    Effacer les filtres
                </button>
            </div>
            @endforelse
        </div>

        <!-- Pagination -->
        <div class="mt-8">
            {{ $hotels->links() }}
        </div>
    </section>
</div>
