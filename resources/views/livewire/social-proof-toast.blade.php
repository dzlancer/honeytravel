<div wire:poll.30s="refreshData">
    @if($showToast)
    <div class="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-40 animate-bounce-in"
         x-data="{ show: true }"
         x-show="show"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 translate-y-4"
         x-transition:enter-end="opacity-100 translate-y-0"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100 translate-y-0"
         x-transition:leave-end="opacity-0 translate-y-4"
         x-init="setTimeout(() => show = false, 8000)">
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
            <div class="flex items-start gap-3">
                <span class="text-2xl">🔥</span>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">
                        {{ $bookingsToday }} Algeriens ont reserve aujourd'hui
                    </p>
                    <p class="text-xs text-gray-500 mt-0.5">
                        Quelqu'un de {{ $latestCity }} vient de reserver
                    </p>
                </div>
                <button wire:click="dismissToast" @click="show = false" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
        </div>
    </div>
    @endif
</div>
