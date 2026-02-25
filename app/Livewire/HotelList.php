<?php

namespace App\Livewire;

use App\Models\Hotel;
use Livewire\Component;
use Livewire\WithPagination;

class HotelList extends Component
{
    use WithPagination;

    public string $search = '';
    public string $district = '';
    public string $stars = '';
    public string $sortBy = 'sale_price_dzd';
    public string $sortDir = 'asc';
    public float $minPrice = 0;
    public float $maxPrice = 200000;

    protected $queryString = [
        'search' => ['except' => ''],
        'district' => ['except' => ''],
        'stars' => ['except' => ''],
        'sortBy' => ['except' => 'sale_price_dzd'],
    ];

    public function updatingSearch(): void
    {
        $this->resetPage();
    }

    public function updatingDistrict(): void
    {
        $this->resetPage();
    }

    public function updatingStars(): void
    {
        $this->resetPage();
    }

    public function sort(string $field): void
    {
        if ($this->sortBy === $field) {
            $this->sortDir = $this->sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            $this->sortBy = $field;
            $this->sortDir = 'asc';
        }
    }

    public function clearFilters(): void
    {
        $this->reset(['search', 'district', 'stars', 'minPrice', 'maxPrice']);
        $this->resetPage();
    }

    public function render()
    {
        $query = Hotel::active()->with('variants');

        if ($this->search) {
            $query->where(function ($q) {
                $q->where('name', 'like', '%' . $this->search . '%')
                  ->orWhere('district', 'like', '%' . $this->search . '%')
                  ->orWhere('description_fr', 'like', '%' . $this->search . '%');
            });
        }

        if ($this->district) {
            $query->where('district', $this->district);
        }

        if ($this->stars) {
            $query->where('star_rating', $this->stars);
        }

        if ($this->minPrice > 0) {
            $query->where('sale_price_dzd', '>=', $this->minPrice);
        }

        if ($this->maxPrice < 200000) {
            $query->where('sale_price_dzd', '<=', $this->maxPrice);
        }

        $query->orderBy($this->sortBy, $this->sortDir);

        $hotels = $query->paginate(12);

        $districts = Hotel::active()
            ->selectRaw('district, COUNT(*) as count')
            ->groupBy('district')
            ->orderBy('district')
            ->pluck('count', 'district');

        return view('livewire.hotel-list', [
            'hotels' => $hotels,
            'districts' => $districts,
        ]);
    }
}
