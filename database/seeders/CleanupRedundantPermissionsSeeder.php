<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\ModuleButton;
use App\Models\UserRolePermission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CleanupRedundantPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * This seeder removes redundant "Access [Module]" permissions for modules
     * that have specific tab-level permissions.
     */
    public function run(): void
    {
        // Modules that have specific tab permissions (should not have generic Access)
        $modulesWithTabPermissions = ['Email', 'Document Management', 'Information Panel', 'Support', 'System Configurations'];
        
        $this->command->info('Cleaning up redundant "Access" permissions for modules with tab-level permissions...');

        foreach ($modulesWithTabPermissions as $moduleName) {
            $module = Module::where('module_name', $moduleName)->first();
            
            if (!$module) {
                $this->command->warn("Module '{$moduleName}' not found, skipping...");
                continue;
            }

            // Find the generic "Access" button for this module
            $accessButton = ModuleButton::where('module_id', $module->id)
                ->where('mod_button_code', $module->module_code . '-ACCESS')
                ->first();

            if ($accessButton) {
                // Delete all permissions for this access button
                $deletedPermissions = UserRolePermission::where('mod_button_id', $accessButton->id)->delete();
                
                // Delete the access button itself
                $accessButton->delete();
                
                $this->command->info("✓ Removed redundant 'Access {$moduleName}' permission ({$deletedPermissions} permissions deleted)");
            } else {
                $this->command->info("✓ No redundant 'Access {$moduleName}' permission found");
            }
        }

        $this->command->info('Cleanup completed. Only tab-level permissions remain for these modules.');
    }
}