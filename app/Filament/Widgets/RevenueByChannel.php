<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use Filament\Widgets\ChartWidget;

class RevenueByChannel extends ChartWidget
{
    protected static ?string $heading = 'Revenue by Channel';
    protected static ?int $sort = 3;

    protected function getData(): array
    {
        $channels = Booking::where('status', '!=', 'cancelled')
            ->selectRaw('channel, SUM(total_dzd) as total')
            ->groupBy('channel')
            ->pluck('total', 'channel')
            ->toArray();

        $colors = [
            'website' => '#f59e0b',
            'whatsapp' => '#25d366',
            'instagram' => '#e1306c',
            'facebook' => '#1877f2',
            'tiktok' => '#000000',
            'phone' => '#6b7280',
            'walk_in' => '#8b5cf6',
        ];

        return [
            'datasets' => [
                [
                    'data' => array_values($channels),
                    'backgroundColor' => array_map(fn ($ch) => $colors[$ch] ?? '#6b7280', array_keys($channels)),
                ],
            ],
            'labels' => array_map('ucfirst', array_keys($channels)),
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
