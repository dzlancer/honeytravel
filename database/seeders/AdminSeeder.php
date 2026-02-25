<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $roles = [
            'super_admin' => 'Full system access',
            'hotel_manager' => 'Manage hotels, variants, pricing',
            'crm_agent' => 'Manage customers and bookings',
            'analyst' => 'View-only analytics access',
        ];

        foreach ($roles as $name => $description) {
            Role::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        // Create permissions
        $permissions = [
            'view_hotels', 'create_hotels', 'edit_hotels', 'delete_hotels',
            'view_bookings', 'create_bookings', 'edit_bookings', 'delete_bookings',
            'view_customers', 'create_customers', 'edit_customers', 'delete_customers',
            'view_products', 'create_products', 'edit_products', 'delete_products',
            'view_seasons', 'create_seasons', 'edit_seasons', 'delete_seasons',
            'view_analytics', 'manage_settings', 'import_data', 'export_data',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Assign permissions to roles
        $superAdmin = Role::findByName('super_admin');
        $superAdmin->syncPermissions(Permission::all());

        $hotelManager = Role::findByName('hotel_manager');
        $hotelManager->syncPermissions([
            'view_hotels', 'create_hotels', 'edit_hotels',
            'view_bookings', 'edit_bookings',
            'view_products', 'create_products', 'edit_products',
            'view_seasons', 'create_seasons', 'edit_seasons',
            'view_analytics',
        ]);

        $crmAgent = Role::findByName('crm_agent');
        $crmAgent->syncPermissions([
            'view_hotels',
            'view_bookings', 'create_bookings', 'edit_bookings',
            'view_customers', 'create_customers', 'edit_customers',
            'view_analytics',
        ]);

        $analyst = Role::findByName('analyst');
        $analyst->syncPermissions([
            'view_hotels', 'view_bookings', 'view_customers',
            'view_products', 'view_seasons', 'view_analytics',
        ]);

        // Create super admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@honeytravelcheraga.com'],
            [
                'name' => 'Honey Travel Admin',
                'password' => Hash::make('HoneyTravel2026!'),
            ]
        );
        $admin->assignRole('super_admin');

        $this->command->info('Admin user created: admin@honeytravelcheraga.com / HoneyTravel2026!');
    }
}
