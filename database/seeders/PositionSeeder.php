<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Position;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            [
                'position_name' => 'STUDENT',
                'description' => 'Student position for enrolled students',
                'user_role_id' => 2, 
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'position_name' => 'IT MANAGER',
                'description' => 'IT Manager position for IT managers',
                'user_role_id' => 1, 
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'position_name' => 'REGISTRAR STAFF',
                'description' => 'Registrar Staff position for registrar staff',
                'user_role_id' => 3, 
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'position_name' => 'UNIVERSITY REGISTRAR',
                'description' => 'Dean position for deans',
                'user_role_id' => 4, 
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'position_name' => 'DEAN',
                'description' => 'Dean position for deans',
                'user_role_id' => 6, 
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        Position::truncate();
        Position::insert($positions);
    }
}
