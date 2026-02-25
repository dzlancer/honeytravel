<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager', 'analyst']);
    }

    public function view(User $user, Product $product): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager', 'analyst']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager']);
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasAnyRole(['super_admin', 'hotel_manager']);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasRole('super_admin');
    }

    public function restore(User $user, Product $product): bool
    {
        return $user->hasRole('super_admin');
    }

    public function forceDelete(User $user, Product $product): bool
    {
        return $user->hasRole('super_admin');
    }
}
