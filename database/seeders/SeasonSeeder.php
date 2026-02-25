<?php

namespace Database\Seeders;

use App\Models\Season;
use Illuminate\Database\Seeder;

class SeasonSeeder extends Seeder
{
    public function run(): void
    {
        $seasons = [
            ['name' => 'Peak Summer', 'start_date' => '2026-06-15', 'end_date' => '2026-09-15', 'multiplier' => 1.30, 'color' => '#ef4444'],
            ['name' => 'Eid Al-Adha', 'start_date' => '2026-06-06', 'end_date' => '2026-06-12', 'multiplier' => 1.40, 'color' => '#f59e0b'],
            ['name' => 'Spring', 'start_date' => '2026-03-15', 'end_date' => '2026-06-14', 'multiplier' => 1.15, 'color' => '#10b981'],
            ['name' => 'Winter Low', 'start_date' => '2026-11-01', 'end_date' => '2027-02-28', 'multiplier' => 0.90, 'color' => '#3b82f6'],
            ['name' => 'New Year', 'start_date' => '2026-12-25', 'end_date' => '2027-01-05', 'multiplier' => 1.25, 'color' => '#8b5cf6'],
        ];

        foreach ($seasons as $season) {
            Season::updateOrCreate(
                ['name' => $season['name']],
                $season
            );
        }

        $this->command->info('Seeded ' . count($seasons) . ' seasons.');
    }
}
