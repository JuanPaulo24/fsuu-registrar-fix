<?php

namespace Database\Seeders;

use App\Models\RefCivilStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CivilStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RefCivilStatus::truncate();

        RefCivilStatus::create([
            'civil_status' => 'Single',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        RefCivilStatus::create([
            'civil_status' => 'Married',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        RefCivilStatus::create([
            'civil_status' => 'Widowed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        RefCivilStatus::create([
            'civil_status' => 'Divorced',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

    }
}
