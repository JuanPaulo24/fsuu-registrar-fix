<?php

namespace Database\Seeders;

use App\Models\RefReligion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReligionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RefReligion::truncate();

        $religions = [
            [
                'religion_type' => 'Roman Catholic',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'religion_type' => 'Islam',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'religion_type' => 'Protestant',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'religion_type' => 'Others',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        RefReligion::insert($religions);
    }
}
