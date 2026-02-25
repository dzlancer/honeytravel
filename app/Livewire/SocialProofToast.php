<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Lazy;

#[Lazy]
class SocialProofToast extends Component
{
    public int $bookingsToday = 0;
    public string $latestCity = '';
    public string $latestHotel = '';
    public bool $showToast = false;

    public function mount(): void
    {
        $this->refreshData();
    }

    public function refreshData(): void
    {
        $cities = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Setif', 'Blida', 'Tlemcen', 'Batna'];
        $this->bookingsToday = rand(12, 45);
        $this->latestCity = $cities[array_rand($cities)];
        $this->showToast = true;
    }

    public function dismissToast(): void
    {
        $this->showToast = false;
    }

    public function render()
    {
        return view('livewire.social-proof-toast');
    }
}
