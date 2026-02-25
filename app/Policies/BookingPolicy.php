<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager', 'crm_agent', 'analyst']);
    }

    public function view(User $user, Booking $booking): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager', 'crm_agent', 'analyst']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager', 'crm_agent']);
    }

    public function update(User $user, Booking $booking): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager', 'crm_agent']);
    }

    public function delete(User $user, Booking $booking): bool
    {
        return $user->hasRole('super_admin');
    }

    public function restore(User $user, Booking $booking): bool
    {
        return $user->hasRole('super_admin');
    }

    public function forceDelete(User $user, Booking $booking): bool
    {
        return $user->hasRole('super_admin');
    }
}
