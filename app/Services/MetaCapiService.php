<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaCapiService
{
    protected string $pixelId;
    protected string $accessToken;
    protected string $apiVersion;

    public function __construct()
    {
        $this->pixelId = config('services.meta.pixel_id', '');
        $this->accessToken = config('services.meta.access_token', '');
        $this->apiVersion = config('services.meta.api_version', 'v18.0');
    }

    public function trackEvent(string $eventName, array $userData = [], array $customData = [], ?string $eventSourceUrl = null): bool
    {
        if (empty($this->pixelId) || empty($this->accessToken)) {
            Log::info('Meta CAPI (demo mode)', compact('eventName', 'userData', 'customData'));
            return true;
        }

        $event = [
            'event_name' => $eventName,
            'event_time' => time(),
            'action_source' => 'website',
            'event_source_url' => $eventSourceUrl ?? config('app.url'),
            'user_data' => $this->hashUserData($userData),
            'custom_data' => $customData,
        ];

        try {
            $response = Http::post(
                "https://graph.facebook.com/{$this->apiVersion}/{$this->pixelId}/events",
                [
                    'data' => [$event],
                    'access_token' => $this->accessToken,
                ]
            );

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Meta CAPI error', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function viewContent(array $userData, string $contentId, string $contentName, float $value, string $currency = 'DZD'): bool
    {
        return $this->trackEvent('ViewContent', $userData, [
            'content_ids' => [$contentId],
            'content_name' => $contentName,
            'content_type' => 'hotel',
            'value' => $value,
            'currency' => $currency,
        ]);
    }

    public function initiateCheckout(array $userData, array $contentIds, float $value, string $currency = 'DZD'): bool
    {
        return $this->trackEvent('InitiateCheckout', $userData, [
            'content_ids' => $contentIds,
            'num_items' => count($contentIds),
            'value' => $value,
            'currency' => $currency,
        ]);
    }

    public function purchase(array $userData, array $contentIds, float $value, string $currency = 'DZD'): bool
    {
        return $this->trackEvent('Purchase', $userData, [
            'content_ids' => $contentIds,
            'num_items' => count($contentIds),
            'value' => $value,
            'currency' => $currency,
        ]);
    }

    protected function hashUserData(array $data): array
    {
        $hashed = [];
        foreach (['em', 'ph', 'fn', 'ln', 'ct', 'st', 'zp', 'country'] as $field) {
            if (isset($data[$field])) {
                $hashed[$field] = hash('sha256', strtolower(trim($data[$field])));
            }
        }
        if (isset($data['fbp'])) $hashed['fbp'] = $data['fbp'];
        if (isset($data['fbc'])) $hashed['fbc'] = $data['fbc'];
        if (isset($data['client_ip_address'])) $hashed['client_ip_address'] = $data['client_ip_address'];
        if (isset($data['client_user_agent'])) $hashed['client_user_agent'] = $data['client_user_agent'];

        return $hashed;
    }
}
