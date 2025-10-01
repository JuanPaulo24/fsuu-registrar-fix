<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\ModuleButton;
use App\Models\UserRole;
use App\Models\UserRolePermission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserModuleAccessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * This seeder grants SUPERADMIN role access to all modules.
     * Since we're focusing only on module access and not specific module buttons yet,
     * we'll create basic access permissions that can be extended later.
     */
    public function run(): void
    {
        // Get SUPERADMIN role (should be ID 1 based on UserRoleSeeder)
        $superAdminRole = UserRole::where('user_role', 'SUPERADMIN')->first();
        
        if (!$superAdminRole) {
            $this->command->error('SUPERADMIN role not found. Please run UserRoleSeeder first.');
            return;
        }

        // Get all modules
        $modules = Module::all();
        
        if ($modules->isEmpty()) {
            $this->command->error('No modules found. Please run ModuleSeeder first.');
            return;
        }

        $this->command->info('Creating module access for SUPERADMIN role...');

        // Modules that only need generic access (no specific tabs)
        // Note: Dashboard, Student Profiles, Users, QR Scanner, and Support now use hierarchical tab permissions in DetailedModuleButtonsSeeder
        $modulesWithGenericAccess = [];
        
        // For modules that only need generic access, create basic ACCESS buttons
        foreach ($modules as $module) {
            // Only create generic access for modules without specific tab permissions
            if (in_array($module->module_name, $modulesWithGenericAccess)) {
                // Create or get basic ACCESS button for this module
                $moduleButton = ModuleButton::firstOrCreate([
                    'module_id' => $module->id,
                    'mod_button_code' => $module->module_code . '-ACCESS',
                ], [
                    'mod_button_name' => 'Access ' . $module->module_name,
                    'mod_button_description' => 'Basic access permission for ' . $module->module_name . ' module',
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // All basic modules are enabled for SUPERADMIN
                $status = 1;
                
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

                $this->command->info("✓ Granted access to {$module->module_name} module");
            } else {
                $this->command->info("✓ Skipped {$module->module_name} - will use tab-level permissions");
            }
        }

        $this->command->info('SUPERADMIN role basic module permissions configured. Tab-level permissions handled by ModuleTabPermissionsSeeder.');
    }
}