<div>
    <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <a href="/" wire:navigate class="hover:text-amber-600">Accueil</a>
            <span>/</span>
            <a href="/hotels/{{ $hotel->slug }}" wire:navigate class="hover:text-amber-600">{{ $hotel->name }}</a>
            <span>/</span>
            <span class="text-gray-900">Reservation</span>
        </nav>

        <!-- Progress Steps -->
        <div class="flex items-center justify-between mb-8">
            @foreach(['Dates', 'Details', 'Paiement', 'Resume', 'Confirmation'] as $i => $label)
                <div class="flex items-center {{ $i < 4 ? 'flex-1' : '' }}">
                    <div class="flex flex-col items-center">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                            {{ $step > $i + 1 ? 'bg-green-500 text-white' : ($step === $i + 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500') }}">
                            @if($step > $i + 1)
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            @else
                                {{ $i + 1 }}
                            @endif
                        </div>
                        <span class="text-xs mt-1 {{ $step === $i + 1 ? 'text-amber-600 font-medium' : 'text-gray-400' }}">{{ $label }}</span>
                    </div>
                    @if($i < 4)
                        <div class="flex-1 h-0.5 mx-2 {{ $step > $i + 1 ? 'bg-green-500' : 'bg-gray-200' }}"></div>
                    @endif
                </div>
            @endforeach
        </div>

        <!-- Hotel Summary -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-4">
            <div class="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex-shrink-0 overflow-hidden">
                @if($hotel->images && count($hotel->images) > 0 && $hotel->images[0])
                    <img src="{{ $hotel->images[0] }}" alt="{{ $hotel->name }}" class="w-full h-full object-cover" onerror="this.style.display='none'">
                @endif
            </div>
            <div>
                <h3 class="font-semibold text-gray-900">{{ $hotel->name }}</h3>
                <p class="text-sm text-gray-500">{{ $hotel->district }}, Istanbul | {{ $variant->night_label }}</p>
                <p class="text-amber-600 font-bold">{{ $variant->formatted_price }}</p>
            </div>
        </div>

        <!-- Step Content -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {{-- Step 1: Dates --}}
            @if($step === 1)
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Choisir vos dates</h2>
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date d'arrivee</label>
                        <input wire:model="checkIn" type="date" min="{{ now()->addDays(1)->format('Y-m-d') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                        @error('checkIn') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Date de depart</label>
                        <input wire:model="checkOut" type="date"
                               class="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                        @error('checkOut') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                        <select wire:model="rooms" class="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            @for($i = 1; $i <= 10; $i++)
                                <option value="{{ $i }}">{{ $i }} chambre{{ $i > 1 ? 's' : '' }}</option>
                            @endfor
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Voyageurs</label>
                        <select wire:model="guests" class="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            @for($i = 1; $i <= 20; $i++)
                                <option value="{{ $i }}">{{ $i }} personne{{ $i > 1 ? 's' : '' }}</option>
                            @endfor
                        </select>
                    </div>
                </div>
            </div>
            @endif

            {{-- Step 2: Guest Details --}}
            @if($step === 2)
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Informations voyageur</h2>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                    <input wire:model="fullName" type="text" placeholder="Mohamed Benali"
                           class="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                    @error('fullName') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Telephone *</label>
                        <input wire:model="phone" type="tel" placeholder="+213 5XX XXX XXX"
                               class="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                        @error('phone') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                        <input wire:model="whatsapp" type="tel" placeholder="+213 5XX XXX XXX"
                               class="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                        @error('whatsapp') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input wire:model="email" type="email" placeholder="email@example.com"
                           class="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                        <input wire:model="city" type="text" placeholder="Alger"
                               class="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">N° Passeport</label>
                        <input wire:model="passportNumber" type="text" placeholder="Optionnel"
                               class="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                    </div>
                </div>
            </div>
            @endif

            {{-- Step 3: Payment --}}
            @if($step === 3)
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Mode de paiement</h2>
            <div class="space-y-3">
                @foreach([
                    'cib' => ['label' => 'CIB / Edahabia (D17)', 'desc' => 'Paiement par carte bancaire algerienne', 'icon' => '💳'],
                    'baridimob' => ['label' => 'BaridiMob', 'desc' => 'Virement via application BaridiMob', 'icon' => '📱'],
                    'cash' => ['label' => 'Especes au bureau', 'desc' => 'Paiement en especes a notre bureau de Cheraga', 'icon' => '💵'],
                    'reserve' => ['label' => 'Reserver & payer a l\'hotel', 'desc' => 'Reservez maintenant, payez a l\'arrivee a Istanbul', 'icon' => '🏨'],
                ] as $method => $info)
                <label class="flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition
                    {{ $paymentMethod === $method ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300' }}">
                    <input wire:model="paymentMethod" type="radio" name="paymentMethod" value="{{ $method }}"
                           class="mt-1 text-amber-500 focus:ring-amber-500">
                    <div>
                        <span class="text-2xl mr-2">{{ $info['icon'] }}</span>
                        <span class="font-semibold text-gray-900">{{ $info['label'] }}</span>
                        <p class="text-sm text-gray-500 mt-0.5">{{ $info['desc'] }}</p>
                    </div>
                </label>
                @endforeach
            </div>
            @endif

            {{-- Step 4: Price Summary --}}
            @if($step === 4)
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Resume de votre reservation</h2>
            <div class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="font-semibold mb-3">Details</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between"><span class="text-gray-500">Hotel</span><span>{{ $hotel->name }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Formule</span><span>{{ $variant->night_label }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Check-in</span><span>{{ \Carbon\Carbon::parse($checkIn)->format('d/m/Y') }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Check-out</span><span>{{ \Carbon\Carbon::parse($checkOut)->format('d/m/Y') }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Chambres</span><span>{{ $rooms }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Voyageurs</span><span>{{ $guests }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Voyageur</span><span>{{ $fullName }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">WhatsApp</span><span>{{ $whatsapp }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">Paiement</span><span>{{ ucfirst($paymentMethod) }}</span></div>
                    </div>
                </div>

                @if(!empty($priceBreakdown))
                <div class="bg-amber-50 rounded-lg p-4">
                    <h3 class="font-semibold mb-3">Prix</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-500">Prix par chambre</span>
                            <span>{{ number_format($priceBreakdown['honey_price_dzd'], 0, ',', ' ') }} DZD</span>
                        </div>
                        @if($rooms > 1)
                        <div class="flex justify-between">
                            <span class="text-gray-500">x {{ $rooms }} chambres</span>
                            <span></span>
                        </div>
                        @endif
                        <div class="flex justify-between pt-2 border-t border-amber-200 text-lg font-bold text-amber-600">
                            <span>Total</span>
                            <span>{{ number_format($priceBreakdown['total_dzd'], 0, ',', ' ') }} DZD</span>
                        </div>
                        <div class="text-xs text-gray-500 text-right">
                            ≈ {{ number_format($priceBreakdown['total_eur'], 2) }} EUR
                        </div>
                    </div>
                </div>
                @endif
            </div>
            @endif

            {{-- Step 5: Confirmation --}}
            @if($step === 5)
            <div class="text-center py-8">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Reservation Confirmee!</h2>
                <p class="text-gray-500 mb-4">Votre reference de reservation:</p>
                <div class="inline-block bg-amber-50 border-2 border-amber-500 rounded-xl px-8 py-4 mb-6">
                    <span class="text-3xl font-bold text-amber-600 tracking-wider">{{ $bookingRef }}</span>
                </div>
                <p class="text-gray-600 mb-8">
                    Vous recevrez une confirmation sur WhatsApp au <strong>{{ $whatsapp }}</strong>.<br>
                    Notre equipe vous contactera sous peu.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="https://wa.me/213549591903?text=Bonjour%2C%20ma%20reference%20est%20{{ $bookingRef }}" target="_blank"
                       class="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Contacter sur WhatsApp
                    </a>
                    <a href="/" wire:navigate class="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition">
                        Retour a l'accueil
                    </a>
                </div>
            </div>
            @endif

            {{-- Navigation Buttons --}}
            @if($step < 5)
            <div class="flex justify-between mt-8 pt-6 border-t">
                @if($step > 1)
                    <button wire:click="previousStep" class="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                        Retour
                    </button>
                @else
                    <div></div>
                @endif
                <button wire:click="nextStep" class="px-8 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition">
                    {{ $step === 4 ? 'Confirmer la reservation' : 'Continuer' }}
                </button>
            </div>
            @endif
        </div>
    </section>
</div>
