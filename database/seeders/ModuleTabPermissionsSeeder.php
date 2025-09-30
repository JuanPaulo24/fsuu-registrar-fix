<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\ModuleButton;
use App\Models\UserRole;
use App\Models\UserRolePermission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ModuleTabPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * This seeder creates module buttons for tabs within each module
     * and sets up permissions for different roles.
     */
    public function run(): void
    {
        $this->command->info('Creating tab-level permissions for modules...');

        // Get SUPERADMIN role
        $superAdminRole = UserRole::where('user_role', 'SUPERADMIN')->first();
        
        if (!$superAdminRole) {
            $this->command->error('SUPERADMIN role not found. Please run UserRoleSeeder first.');
            return;
        }

        // Define tab permissions for each module
        // Note: Document Management is now handled by DetailedModuleButtonsSeeder with hierarchical permissions
        $moduleTabsConfig = [
            'Email' => [
                'M-04-EMAIL' => [
                    'name' => 'Email Management',
                    'description' => 'Access to email composition and management features'
                ],
                'M-04-TEMPLATE' => [
                    'name' => 'Email Template Management', 
                    'description' => 'Access to email template creation and editing'
                ]
            ],
            'Information Panel' => [
                'M-07-CMS' => [
                    'name' => 'Content Management System',
                    'description' => 'Access to CMS for managing announcements and posts'
                ],
                'M-07-EVENTS' => [
                    'name' => 'Events Management',
                    'description' => 'Access to calendar events and event management'
                ]
            ],
            'Support' => [
                'M-08-MANUAL' => [
                    'name' => 'System Manual',
                    'description' => 'Access to system manual and documentation'
                ],
                'M-08-CONTACT' => [
                    'name' => 'Contact Information',
                    'description' => 'Access to contact information management'
                ],
                'M-08-STATUS' => [
                    'name' => 'System Status',
                    'description' => 'Access to system status monitoring and diagnostics'
                ]
            ],
            'System Configurations' => [
                'M-09-USERS' => [
                    'name' => 'User Management',
                    'description' => 'Access to user account management and administration'
                ],
                'M-09-TITLES' => [
                    'name' => 'Title Management',
                    'description' => 'Access to academic titles and course management'
                ],
                'M-09-ROLES' => [
                    'name' => 'Roles & Permissions',
                    'description' => 'Access to role and permission management'
                ],
                'M-09-LOGS' => [
                    'name' => 'Login Logs',
                    'description' => 'Access to login logs and authentication monitoring'
                ],
                'M-09-QR' => [
                    'name' => 'QR History',
                    'description' => 'Access to QR code scan history and tracking'
                ]
            ]
        ];

        // Process each module
        foreach ($moduleTabsConfig as $moduleName => $tabs) {
            $module = Module::where('module_name', $moduleName)->first();
            
            if (!$module) {
                $this->command->warn("Module '{$moduleName}' not found. Skipping...");
                continue;
            }

            $this->command->info("Processing tabs for {$moduleName} module...");

            // Create module buttons for each tab
            foreach ($tabs as $buttonCode => $buttonConfig) {
                // Create or update module button
                $moduleButton = ModuleButton::updateOrCreate([
                    'module_id' => $module->id,
                    'mod_button_code' => $buttonCode,
                ], [
                    'mod_button_name' => $buttonConfig['name'],
                    'mod_button_description' => $buttonConfig['description'],
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Determine permission status based on module and role
                $status = $this->determinePermissionStatus($moduleName, $buttonCode, 'SUPERADMIN');

                // Set permission for SUPERADMIN role
                UserRolePermission::updateOrCreate([
                    'user_role_id' => $superAdminRole->id,
                    'mod_button_id' => $moduleButton->id,
                ], [
                    'status' => $status,
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $statusText = $status ? 'Granted' : 'Denied';
                $this->command->info("  ✓ {$statusText} access to {$buttonConfig['name']}");
            }
        }

        $this->command->info('Tab-level permissions created successfully!');
    }

    /**
     * Determine permission status based on module, button, and role
     */
    private function determinePermissionStatus($moduleName, $buttonCode, $roleName): int
    {
        // Grant all permissions to SUPERADMIN (including Support)
        return 1; // Granted
    }
}