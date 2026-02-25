<?php

namespace App\Policies;

use App\Models\Hotel;
use App\Models\User;

class HotelPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager', 'analyst']);
    }

    public function view(User $user, Hotel $hotel): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager', 'analyst']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager']);
    }

    public function update(User $user, Hotel $hotel): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager']);
    }

    public function delete(User $user, Hotel $hotel): bool
    {
        return $user->hasRole('super_admin');
    }

    public function restore(User $user, Hotel $hotel): bool
    {
        return $user->hasRole('super_admin');
    }

    public function forceDelete(User $user, Hotel $hotel): bool
    {
        return $user->hasRole('super_admin');
    }
}
