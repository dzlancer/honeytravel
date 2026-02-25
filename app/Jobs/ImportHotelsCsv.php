<?php

namespace App\Jobs;

use App\Models\Hotel;
use App\Models\HotelVariant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ImportHotelsCsv implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 300;

    public function __construct(
        public string $filePath,
        public ?int $userId = null
    ) {}

    public function handle(): void
    {
        $handle = fopen($this->filePath, 'r');
        if (!$handle) {
            Log::error('ImportHotelsCsv: Could not open file', ['path' => $this->filePath]);
            return;
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return;
        }

        $header = array_map('trim', $header);
        $imported = 0;
        $errors = [];

        while (($row = fgetcsv($handle)) !== false) {
            try {
                $data = array_combine($header, $row);
                if (!$data) {
                    continue;
                }

                $hotelId = trim($data['hotel_id'] ?? $data['id'] ?? '');
                if (empty($hotelId)) {
                    continue;
                }

                // Extract base hotel ID (remove _4N, _6N, _7N suffix)
                $baseHotelId = preg_replace('/_\d+N$/', '', $hotelId);
                $nightsMatch = [];
                preg_match('/_(\d+)N$/', $hotelId, $nightsMatch);
                $nights = isset($nightsMatch[1]) ? (int) $nightsMatch[1] : 4;

                $name = trim($data['name'] ?? $data['title'] ?? 'Unknown Hotel');
                $basePriceDzd = (float) ($data['base_price'] ?? $data['price'] ?? 0);
                $salePriceDzd = (float) ($data['sale_price'] ?? $data['special_price'] ?? $basePriceDzd);

                $hotel = Hotel::updateOrCreate(
                    ['hotel_id' => $baseHotelId],
                    [
                        'name' => $name,
                        'slug' => Str::slug($name),
                        'description' => $data['description'] ?? null,
                        'star_rating' => (int) ($data['star_rating'] ?? $data['stars'] ?? 3),
                        'district' => $data['neighborhood[0]'] ?? $data['district'] ?? $data['neighborhood'] ?? 'Istanbul',
                        'address' => $data['address.addr1'] ?? $data['address'] ?? '',
                        'latitude' => (float) ($data['latitude'] ?? 0),
                        'longitude' => (float) ($data['longitude'] ?? 0),
                        'base_price_dzd' => $basePriceDzd,
                        'sale_price_dzd' => $salePriceDzd,
                        'base_price_eur' => round($basePriceDzd * 0.0067, 2),
                        'sale_price_eur' => round($salePriceDzd * 0.0067, 2),
                        'is_active' => true,
                    ]
                );

                HotelVariant::updateOrCreate(
                    ['variant_id' => $hotelId],
                    [
                        'hotel_id' => $hotel->id,
                        'nights' => $nights,
                        'base_price_dzd' => $basePriceDzd,
                        'sale_price_dzd' => $salePriceDzd,
                        'base_price_eur' => round($basePriceDzd * 0.0067, 2),
                        'sale_price_eur' => round($salePriceDzd * 0.0067, 2),
                        'is_active' => true,
                    ]
                );

                $imported++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$imported}: {$e->getMessage()}";
                Log::warning('ImportHotelsCsv: Row error', ['error' => $e->getMessage()]);
            }
        }

        fclose($handle);

        Log::info('ImportHotelsCsv completed', [
            'imported' => $imported,
            'errors' => count($errors),
        ]);
    }
}
