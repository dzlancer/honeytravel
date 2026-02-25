<?php

namespace App\Livewire;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Hotel;
use App\Models\HotelVariant;
use App\Services\PricingService;
use Livewire\Component;
use Illuminate\Support\Str;

class BookingWizard extends Component
{
    public int $step = 1;
    public int $variantId;
    public ?HotelVariant $variant = null;
    public ?Hotel $hotel = null;

    // Step 1: Dates
    public string $checkIn = '';
    public string $checkOut = '';
    public int $rooms = 1;
    public int $guests = 2;

    // Step 2: Guest details
    public string $fullName = '';
    public string $email = '';
    public string $phone = '';
    public string $whatsapp = '';
    public string $city = '';
    public string $passportNumber = '';

    // Step 3: Payment
    public string $paymentMethod = 'reserve';

    // Step 4: Price breakdown
    public array $priceBreakdown = [];

    // Step 5: Confirmation
    public ?string $bookingRef = null;

    protected $rules = [
        'checkIn' => 'required|date|after:today',
        'checkOut' => 'required|date|after:checkIn',
        'rooms' => 'required|integer|min:1|max:10',
        'guests' => 'required|integer|min:1|max:20',
        'fullName' => 'required|string|min:3|max:255',
        'phone' => 'required|string|min:10',
        'whatsapp' => 'required|string|min:10',
        'paymentMethod' => 'required|in:cib,baridimob,cash,reserve',
    ];

    public function mount(int $variantId): void
    {
        $this->variantId = $variantId;
        $this->variant = HotelVariant::with('hotel')->findOrFail($variantId);
        $this->hotel = $this->variant->hotel;

        // Default dates
        $this->checkIn = now()->addDays(14)->format('Y-m-d');
        $this->checkOut = now()->addDays(14 + $this->variant->nights)->format('Y-m-d');
    }

    public function nextStep(): void
    {
        if ($this->step === 1) {
            $this->validate([
                'checkIn' => 'required|date|after:today',
                'checkOut' => 'required|date|after:checkIn',
                'rooms' => 'required|integer|min:1|max:10',
                'guests' => 'required|integer|min:1|max:20',
            ]);
        }

        if ($this->step === 2) {
            $this->validate([
                'fullName' => 'required|string|min:3|max:255',
                'phone' => 'required|string|min:10',
                'whatsapp' => 'required|string|min:10',
            ]);
        }

        if ($this->step === 3) {
            $this->validate([
                'paymentMethod' => 'required|in:cib,baridimob,cash,reserve',
            ]);
        }

        if ($this->step === 4) {
            $this->createBooking();
            return;
        }

        if ($this->step < 5) {
            $this->step++;
        }

        // Calculate pricing at step 4
        if ($this->step === 4) {
            $this->calculatePrice();
        }
    }

    public function previousStep(): void
    {
        if ($this->step > 1) {
            $this->step--;
        }
    }

    public function calculatePrice(): void
    {
        $pricingService = app(PricingService::class);
        $this->priceBreakdown = $pricingService->calculatePrice(
            $this->variant,
            $this->checkIn,
            $this->checkOut,
            'website',
            null,
            $this->rooms
        );
        $this->priceBreakdown['total_dzd'] = $this->priceBreakdown['honey_price_dzd'] * $this->rooms;
        $this->priceBreakdown['total_eur'] = $this->priceBreakdown['honey_price_eur'] * $this->rooms;
    }

    protected function createBooking(): void
    {
        $this->calculatePrice();

        // Create or find customer
        $customer = Customer::firstOrCreate(
            ['whatsapp' => $this->whatsapp],
            [
                'full_name' => $this->fullName,
                'email' => $this->email ?: null,
                'phone' => $this->phone,
                'city' => $this->city ?: null,
                'country' => 'Algeria',
                'passport_number' => $this->passportNumber ?: null,
                'acquisition_channel' => 'website',
            ]
        );

        // Create booking
        $booking = Booking::create([
            'reference' => 'BK-' . strtoupper(Str::random(6)),
            'customer_id' => $customer->id,
            'hotel_id' => $this->hotel->id,
            'variant_id' => $this->variant->id,
            'check_in' => $this->checkIn,
            'check_out' => $this->checkOut,
            'nights' => $this->variant->nights,
            'guests' => $this->guests,
            'rooms' => $this->rooms,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'payment_method' => $this->paymentMethod,
            'total_dzd' => $this->priceBreakdown['total_dzd'],
            'total_eur' => $this->priceBreakdown['total_eur'],
            'price_breakdown' => $this->priceBreakdown,
            'channel' => 'website',
        ]);

        $this->bookingRef = $booking->reference;
        $this->step = 5;
    }

    public function render()
    {
        return view('livewire.booking-wizard');
    }
}
