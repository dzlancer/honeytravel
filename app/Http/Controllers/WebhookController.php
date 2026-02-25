<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\WhatsappLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function whatsapp(Request $request): JsonResponse
    {
        Log::info('WhatsApp webhook received', $request->all());

        $entry = $request->input('entry.0.changes.0.value', []);

        if (isset($entry['messages'])) {
            foreach ($entry['messages'] as $message) {
                WhatsappLog::create([
                    'direction' => 'inbound',
                    'message_type' => $message['type'] ?? 'text',
                    'content' => $message['text']['body'] ?? json_encode($message),
                    'status' => 'received',
                    'whatsapp_message_id' => $message['id'] ?? null,
                    'payload' => $message,
                ]);
            }
        }

        // Handle status updates
        if (isset($entry['statuses'])) {
            foreach ($entry['statuses'] as $status) {
                $log = WhatsappLog::where('whatsapp_message_id', $status['id'])->first();
                if ($log) {
                    $log->update(['status' => $status['status'] ?? 'unknown']);
                }
            }
        }

        return response()->json(['status' => 'ok']);
    }

    public function d17Confirmation(Request $request): JsonResponse
    {
        Log::info('D17 payment confirmation received', $request->all());

        $reference = $request->input('reference');
        $amount = $request->input('amount');
        $transactionId = $request->input('transaction_id');

        if (!$reference) {
            return response()->json(['error' => 'Missing reference'], 400);
        }

        $booking = Booking::where('reference', $reference)->first();
        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        $booking->update([
            'payment_status' => 'paid',
            'paid_amount_dzd' => $amount ?? $booking->total_dzd,
            'status' => 'confirmed',
        ]);

        $booking->paymentEvents()->create([
            'type' => 'payment_received',
            'amount_dzd' => $amount ?? $booking->total_dzd,
            'reference' => $transactionId,
            'method' => 'cib',
            'notes' => 'D17 payment confirmation',
        ]);

        return response()->json(['status' => 'ok', 'booking' => $booking->reference]);
    }
}
