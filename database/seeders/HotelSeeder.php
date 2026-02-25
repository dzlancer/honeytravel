<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\HotelVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class HotelSeeder extends Seeder
{
    public function run(): void
    {
        $csvPath = database_path('data/META_FEED_HOTELS_FINAL_CSV_FLAT_20260221_1926.csv');

        if (!file_exists($csvPath)) {
            $this->command->error('CSV file not found at: ' . $csvPath);
            return;
        }

        $handle = fopen($csvPath, 'r');
        // Skip BOM if present
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        $headers = fgetcsv($handle);
        if (!$headers) {
            $this->command->error('Could not read CSV headers');
            return;
        }

        $hotels = [];
        $variants = [];

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < count($headers)) continue;

            $data = array_combine($headers, $row);
            $variantId = $data['hotel_id'] ?? '';
            $hotelIdBase = preg_replace('/_\d+N$/', '', $variantId);
            $nightsMatch = [];
            preg_match('/_(\d+)N$/', $variantId, $nightsMatch);
            $nights = isset($nightsMatch[1]) ? (int) $nightsMatch[1] : 4;

            // Extract hotel name without variant suffix
            $fullName = $data['name'] ?? '';
            $hotelName = preg_replace('/\s*-\s*\d+\s*Nuits?$/i', '', $fullName);

            // Build hotel record (first variant wins for hotel-level data)
            if (!isset($hotels[$hotelIdBase])) {
                $amenities = ['WiFi gratuit', 'Climatisation', 'Petit-dejeuner inclus'];
                $stars = (int) ($data['star_rating'] ?? 3);
                if ($stars >= 4) {
                    $amenities = array_merge($amenities, ['Piscine', 'Spa', 'Room Service', 'Bar', 'Salle de sport']);
                } elseif ($stars >= 3) {
                    $amenities = array_merge($amenities, ['Restaurant', 'Reception 24h/24', 'Coffre-fort']);
                }

                $district = $data['neighborhood[0]'] ?? 'Istanbul';
                if ($district === 'Default' || empty($district)) {
                    $district = 'Istanbul Centre';
                }

                $hotels[$hotelIdBase] = [
                    'hotel_id' => $hotelIdBase,
                    'name' => $hotelName,
                    'slug' => Str::slug($hotelName),
                    'description' => $data['description'] ?? '',
                    'description_fr' => $data['description'] ?? '',
                    'star_rating' => $stars,
                    'address' => $data['address.addr1'] ?? '',
                    'district' => $district,
                    'city' => 'Istanbul',
                    'country' => 'Turkey',
                    'latitude' => (float) ($data['latitude'] ?? 41.0082),
                    'longitude' => (float) ($data['longitude'] ?? 28.9784),
                    'base_price_dzd' => (float) ($data['base_price'] ?? 25000),
                    'sale_price_dzd' => (float) ($data['sale_price'] ?? 23750),
                    'base_price_eur' => round((float) ($data['base_price'] ?? 25000) * 0.0067, 2),
                    'sale_price_eur' => round((float) ($data['sale_price'] ?? 23750) * 0.0067, 2),
                    'amenities' => $amenities,
                    'images' => [
                        $data['image[0].url'] ?? '',
                        $data['image[1].url'] ?? '',
                    ],
                    'seo_meta' => [
                        'title' => $hotelName . ' - Istanbul | Honey Travel',
                        'description' => Str::limit($data['description'] ?? '', 160),
                    ],
                    'contact_phone' => $data['phone'] ?? '+213549591903',
                    'contact_email' => $data['email'] ?? 'contact@honeytravelcheraga.com',
                    'total_rooms' => rand(15, 50),
                    'available_rooms' => rand(5, 20),
                    'is_active' => true,
                    'is_featured' => rand(0, 3) === 0,
                ];
            }

            $variants[] = [
                'hotel_id_base' => $hotelIdBase,
                'variant_id' => $variantId,
                'nights' => $nights,
                'base_price_dzd' => (float) ($data['base_price'] ?? 25000),
                'sale_price_dzd' => (float) ($data['sale_price'] ?? 23750),
                'base_price_eur' => round((float) ($data['base_price'] ?? 25000) * 0.0067, 2),
                'sale_price_eur' => round((float) ($data['sale_price'] ?? 23750) * 0.0067, 2),
            ];
        }

        fclose($handle);

        $this->command->info('Importing ' . count($hotels) . ' hotels with ' . count($variants) . ' variants...');

        // Create hotels
        $hotelModels = [];
        foreach ($hotels as $hotelData) {
            $hotel = Hotel::updateOrCreate(
                ['hotel_id' => $hotelData['hotel_id']],
                $hotelData
            );
            $hotelModels[$hotelData['hotel_id']] = $hotel;
        }

        // Create variants
        foreach ($variants as $variantData) {
            $hotelIdBase = $variantData['hotel_id_base'];
            unset($variantData['hotel_id_base']);

            if (isset($hotelModels[$hotelIdBase])) {
                $variantData['hotel_id'] = $hotelModels[$hotelIdBase]->id;
                HotelVariant::updateOrCreate(
                    ['variant_id' => $variantData['variant_id']],
                    $variantData
                );
            }
        }

        $this->command->info('Seeded ' . count($hotelModels) . ' hotels and ' . count($variants) . ' variants.');
    }
}
