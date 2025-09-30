<?php

namespace Database\Seeders;

use App\Models\ServiceType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $serviceTypes = [
            [
                'service_type' => 'Baptism',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_type' => 'Communion',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_type' => 'Confirmation',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_type' => 'Matrimony',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_type' => 'Memorial',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'service_type' => 'Others',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        ServiceType::truncate();
        ServiceType::insert($serviceTypes);
    }
}
