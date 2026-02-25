<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AbandonedCartReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Booking $booking,
        public int $reminderNumber = 1
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $booking = $this->booking->load(['hotel', 'variant']);
        $subject = match ($this->reminderNumber) {
            1 => "Vous avez oublie votre reservation? - {$booking->hotel->name}",
            2 => "Derniere chance! Prix special pour {$booking->hotel->name}",
            3 => "Offre exclusive - 5% de reduction sur {$booking->hotel->name}",
            default => "Votre reservation vous attend - Honey Travel",
        };

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting("Bonjour {$notifiable->full_name},");

        if ($this->reminderNumber === 1) {
            $message->line("Vous avez commence une reservation pour **{$booking->hotel->name}** mais ne l'avez pas finalisee.")
                ->line("Votre chambre est toujours disponible! Finalisez votre reservation maintenant.");
        } elseif ($this->reminderNumber === 2) {
            $message->line("Les chambres a **{$booking->hotel->name}** se remplissent rapidement!")
                ->line("Ne manquez pas cette opportunite. Reservez maintenant avant qu'il ne soit trop tard.");
        } else {
            $message->line("Offre speciale! Beneficiez de **5% de reduction** sur votre reservation a **{$booking->hotel->name}**.")
                ->line("Utilisez le code **HONEY5** lors de votre reservation.");
        }

        return $message
            ->action('Finaliser ma reservation', url("/booking/{$booking->variant_id}"))
            ->line("Besoin d'aide? Contactez-nous sur WhatsApp: +213549591903")
            ->salutation('Honey Travel Istanbul');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_reference' => $this->booking->reference,
            'reminder_number' => $this->reminderNumber,
        ];
    }
}
