<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the administrator account.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@sigra.test'],
            [
                'name' => 'admin',
                'email_verified_at' => now(),
                'password' => Hash::make('12345'),
            ],
        );
    }
}
