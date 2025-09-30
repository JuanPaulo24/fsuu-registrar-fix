<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use \App\Models\UserRole;
use Illuminate\Database\Seeder;


class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userRoles = [
            [
                'user_role' => 'SUPERADMIN',
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'user_role' => 'STUDENT',
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'user_role' => 'REGISTRAR STAFF',
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'user_role' => 'UNIVERSITY REGISTRAR',
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            [
                'user_role' => 'DEAN',
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'user_role' => 'UNIVERSITY PRESIDENT',
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'user_role' => 'VICE PRESIDENT FOR ACADEMIC AFFAIRS AND RESEARCH',
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        UserRole::truncate();
        UserRole::insert($userRoles);
    }
}


