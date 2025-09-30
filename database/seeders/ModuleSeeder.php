<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                'module_code' => 'M-01',
                'module_name' => 'Dashboard',
                'description' => 'Main dashboard with overview and analytics',
                'system_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'module_code' => 'M-02',
                'module_name' => 'Student Profiles',
                'description' => 'Student profile management and records',
                'system_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'module_code' => 'M-03',
                'module_name' => 'Users',
                'description' => 'User account management and administration',
                'system_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'module_code' => 'M-04',
                'module_name' => 'Email',
                'description' => 'Email communication and template management',
                'system_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'module_code' => 'M-05',
                'module_name' => 'QR Scanner',
                'description' => 'QR code scanning and verification functionality',
                'system_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'module_code' => 'M-06',
                'module_name' => 'Document Management',
                'description' => 'Document management, issuance and verification',
                'system_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'module_code' => 'M-07',
                'module_name' => 'Information Panel',
                'description' => 'Information panel and content management',
                'system_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'module_code' => 'M-08',
                'module_name' => 'Support',
                'description' => 'Help desk and support ticket management',
                'system_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'module_code' => 'M-09',
                'module_name' => 'System Configurations',
                'description' => 'System settings and configuration management',
                'system_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        Module::truncate();
        Module::insert($modules);
    }
}