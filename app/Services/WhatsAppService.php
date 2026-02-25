<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\WhatsappLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected string $apiUrl;
    protected string $apiToken;
    protected string $phoneNumberId;

    public function __construct()
    {
        $this->apiUrl = config('services.whatsapp.api_url', 'https://graph.facebook.com/v18.0');
        $this->apiToken = config('services.whatsapp.token', '');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id', '');
    }

    /**
     * Send a text message via WhatsApp.
     */
    public function sendMessage(string $to, string $message, ?int $bookingId = null, ?int $customerId = null): ?WhatsappLog
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $this->formatPhone($to),
            'type' => 'text',
            'text' => ['body' => $message],
        ];

        return $this->dispatch($payload, $to, $message, 'text', null, $bookingId, $customerId);
    }

    /**
     * Send a template message via WhatsApp.
     */
    public function sendTemplate(string $to, string $templateName, array $parameters = [], ?int $bookingId = null, ?int $customerId = null): ?WhatsappLog
    {
        $components = [];
        if (!empty($parameters)) {
            $params = array_map(fn($p) => ['type' => 'text', 'text' => $p], $parameters);
            $components[] = ['type' => 'body', 'parameters' => $params];
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $this->formatPhone($to),
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => ['code' => 'fr'],
                'components' => $components,
            ],
        ];

        return $this->dispatch($payload, $to, "Template: $templateName", 'template', $templateName, $bookingId, $customerId);
    }

    /**
     * Send booking confirmation message.
     */
    public function sendBookingConfirmation(Booking $booking): ?WhatsappLog
    {
        $customer = $booking->customer;
        if (!$customer || !$customer->whatsapp) return null;

        $hotel = $booking->hotel;
        $message = "Bonjour {$customer->full_name},\n\n";
        $message .= "Votre reservation a ete confirmee!\n\n";
        $message .= "Reference: {$booking->reference}\n";
        $message .= "Hotel: {$hotel->name}\n";
        $message .= "Check-in: {$booking->check_in->format('d/m/Y')}\n";
        $message .= "Check-out: {$booking->check_out->format('d/m/Y')}\n";
        $message .= "Nuits: {$booking->nights}\n";
        $message .= "Total: " . PricingService::formatDzd($booking->total_dzd) . "\n\n";
        $message .= "Merci de votre confiance!\n";
        $message .= "Honey Travel Cheraga";

        return $this->sendMessage($customer->whatsapp, $message, $booking->id, $customer->id);
    }

    /**
     * Send abandoned cart reminder.
     */
    public function sendAbandonedCartReminder(Booking $booking, int $stage = 1): ?WhatsappLog
    {
        $customer = $booking->customer;
        if (!$customer || !$customer->whatsapp) return null;

        $messages = [
            1 => "Bonjour {$customer->full_name}, vous n'avez pas finalise votre reservation pour {$booking->hotel->name}. Completez maintenant et beneficiez de nos tarifs speciaux!",
            2 => "Rappel: Votre reservation {$booking->reference} pour {$booking->hotel->name} est en attente. Les places sont limitees, reservez vite!",
            3 => "Derniere chance! La reservation {$booking->reference} expire bientot. Contactez-nous pour finaliser.",
        ];

        $message = $messages[$stage] ?? $messages[1];
        return $this->sendMessage($customer->whatsapp, $message, $booking->id, $customer->id);
    }

    /**
     * Dispatch API call and log.
     */
    protected function dispatch(array $payload, string $to, string $content, string $type, ?string $templateName, ?int $bookingId, ?int $customerId): ?WhatsappLog
    {
        $status = 'sent';
        $messageId = null;

        if (!empty($this->apiToken)) {
            try {
                $response = Http::withToken($this->apiToken)
                    ->post("{$this->apiUrl}/{$this->phoneNumberId}/messages", $payload);

                if ($response->successful()) {
                    $messageId = $response->json('messages.0.id');
                } else {
                    $status = 'failed';
                    Log::error('WhatsApp API error', ['response' => $response->body()]);
                }
            } catch (\Exception $e) {
                $status = 'failed';
                Log::error('WhatsApp dispatch error', ['error' => $e->getMessage()]);
            }
        } else {
            // Demo mode - log but don't send
            $status = 'demo';
            Log::info('WhatsApp demo message', ['to' => $to, 'content' => $content]);
        }

        return WhatsappLog::create([
            'booking_id' => $bookingId,
            'customer_id' => $customerId,
            'direction' => 'outbound',
            'message_type' => $type,
            'content' => $content,
            'template_name' => $templateName,
            'status' => $status,
            'whatsapp_message_id' => $messageId,
            'payload' => $payload,
        ]);
    }

    protected function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        if (!str_starts_with($phone, '+')) {
            $phone = '+213' . ltrim($phone, '0');
        }
        return $phone;
    }
}
