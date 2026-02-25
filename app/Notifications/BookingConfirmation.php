<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmation extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Booking $booking
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->booking->load(['hotel', 'variant']);

        return (new MailMessage)
            ->subject("Confirmation de reservation #{$booking->reference} - Honey Travel")
            ->greeting("Bonjour {$notifiable->full_name},")
            ->line("Votre reservation a ete confirmee avec succes!")
            ->line("**Hotel:** {$booking->hotel->name}")
            ->line("**Reference:** {$booking->reference}")
            ->line("**Check-in:** {$booking->check_in->format('d/m/Y')}")
            ->line("**Check-out:** {$booking->check_out->format('d/m/Y')}")
            ->line("**Nuits:** {$booking->nights}")
            ->line("**Total:** " . number_format($booking->total_dzd, 0, ',', ' ') . " DZD")
            ->action('Voir ma reservation', url("/booking/confirmation/{$booking->reference}"))
            ->line("Pour toute question, contactez-nous sur WhatsApp: +213549591903")
            ->salutation('Honey Travel Istanbul - Votre partenaire de voyage');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_reference' => $this->booking->reference,
            'hotel_name' => $this->booking->hotel->name ?? '',
            'total_dzd' => $this->booking->total_dzd,
        ];
    }
}
