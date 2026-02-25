<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public Booking $booking,
        public string $type = 'confirmation'
    ) {}

    public function handle(WhatsAppService $whatsAppService): void
    {
        match ($this->type) {
            'confirmation' => $whatsAppService->sendBookingConfirmation($this->booking),
            'abandoned_1' => $whatsAppService->sendAbandonedCartReminder($this->booking, 1),
            'abandoned_2' => $whatsAppService->sendAbandonedCartReminder($this->booking, 2),
            'abandoned_3' => $whatsAppService->sendAbandonedCartReminder($this->booking, 3),
            default => null,
        };
    }

    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Log::error('WhatsApp notification failed', [
            'booking' => $this->booking->reference,
            'type' => $this->type,
            'error' => $exception->getMessage(),
        ]);
    }
}
