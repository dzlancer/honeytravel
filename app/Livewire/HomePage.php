<?php

namespace App\Livewire;

use App\Models\Hotel;
use Livewire\Component;

class HomePage extends Component
{
    public function render()
    {
        $featuredHotels = Hotel::active()
            ->featured()
            ->with('variants')
            ->limit(6)
            ->get();

        $districts = Hotel::active()
            ->selectRaw('district, COUNT(*) as count, MIN(sale_price_dzd) as min_price')
            ->groupBy('district')
            ->orderByDesc('count')
            ->get();

        return view('livewire.home-page', [
            'featuredHotels' => $featuredHotels,
            'districts' => $districts,
        ]);
    }
}
