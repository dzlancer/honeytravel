<?php

namespace App\Jobs;

use App\Models\SocialProofEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class SyncSocialProofCounters implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $bookingsToday = \App\Models\Booking::whereDate('created_at', today())->count();

        Cache::put('social_proof:bookings_today', $bookingsToday, 300);

        SocialProofEvent::create([
            'event_type' => 'booking',
            'count' => $bookingsToday,
        ]);
    }
}
