<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Hotel;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $totalRevenue = Booking::where('status', '!=', 'cancelled')->sum('total_dzd');
        $totalBookings = Booking::count();
        $confirmedBookings = Booking::where('status', 'confirmed')->count();
        $totalCustomers = Customer::count();
        $totalHotels = Hotel::active()->count();
        $avgOrderValue = $totalBookings > 0 ? $totalRevenue / $totalBookings : 0;

        return [
            Stat::make('Total Revenue', toDzd($totalRevenue))
                ->description('All confirmed bookings')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success'),
            Stat::make('Total Bookings', number_format($totalBookings))
                ->description($confirmedBookings . ' confirmed')
                ->descriptionIcon('heroicon-m-calendar')
                ->color('primary'),
            Stat::make('Avg. Order Value', toDzd($avgOrderValue))
                ->description('Per booking')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('warning'),
            Stat::make('Customers', number_format($totalCustomers))
                ->description($totalHotels . ' active hotels')
                ->descriptionIcon('heroicon-m-users')
                ->color('info'),
        ];
    }
}
