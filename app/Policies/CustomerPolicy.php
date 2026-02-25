<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'crm_agent', 'analyst']);
    }

    public function view(User $user, Customer $customer): bool
    {
        return $user->hasAnyRole(['super_admin', 'crm_agent', 'analyst']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'crm_agent']);
    }

    public function update(User $user, Customer $customer): bool
    {
        return $user->hasAnyRole(['super_admin', 'crm_agent']);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->hasRole('super_admin');
    }

    public function restore(User $user, Customer $customer): bool
    {
        return $user->hasRole('super_admin');
    }

    public function forceDelete(User $user, Customer $customer): bool
    {
        return $user->hasRole('super_admin');
    }
}
