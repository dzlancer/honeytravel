<?php

namespace App\Livewire;

use App\Models\Hotel;
use App\Services\PricingService;
use Livewire\Component;
use Illuminate\Support\Facades\Cache;

class HotelDetail extends Component
{
    public Hotel $hotel;
    public ?int $selectedVariantId = null;
    public int $viewers = 0;
    public int $bookingsToday = 0;

    public function mount(string $slug): void
    {
        $this->hotel = Hotel::where('slug', $slug)
            ->active()
            ->with('variants')
            ->firstOrFail();

        // Increment demand counter
        app(PricingService::class)->incrementDemand($this->hotel->id);

        // Social proof
        $this->viewers = rand(3, 15);
        $this->bookingsToday = rand(5, 25);

        // Select first variant by default
        $firstVariant = $this->hotel->variants->first();
        if ($firstVariant) {
            $this->selectedVariantId = $firstVariant->id;
        }
    }

    public function selectVariant(int $variantId): void
    {
        $this->selectedVariantId = $variantId;
    }

    public function render()
    {
        $pricingService = app(PricingService::class);
        $variantPrices = [];

        foreach ($this->hotel->variants as $variant) {
            $variantPrices[$variant->id] = $pricingService->calculatePrice($variant);
        }

        return view('livewire.hotel-detail', [
            'variantPrices' => $variantPrices,
        ]);
    }
}
