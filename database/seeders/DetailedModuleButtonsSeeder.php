<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\ModuleButton;
use App\Models\UserRole;
use App\Models\UserRolePermission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DetailedModuleButtonsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates detailed button-level permissions for specific modules.
     */
    public function run(): void
    {
        $this->command->info('Creating detailed module buttons and permissions...');

        // Get SUPERADMIN role
        $superAdminRole = UserRole::where('user_role', 'SUPERADMIN')->first();
        
        if (!$superAdminRole) {
            $this->command->error('SUPERADMIN role not found.');
            return;
        }

        // Define hierarchical button structures: tabs as parents, buttons as children
        $moduleButtons = [
            'Student Profiles' => [
                // Student Profiles has no tabs, so buttons are direct module buttons
                [
                    'code' => 'M-02-NEW',
                    'name' => 'New Profile',
                    'description' => 'Create new student profiles',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null
                ],
                [
                    'code' => 'M-02-VIEW',
                    'name' => 'View Profile',
                    'description' => 'View and search existing student profiles',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null
                ]
            ],
            'Users' => [
                // Users has no tabs, so buttons are direct module buttons
                [
                    'code' => 'M-03-ADD',
                    'name' => 'Add User',
                    'description' => 'Create new system users',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null
                ],
                [
                    'code' => 'M-03-EDIT',
                    'name' => 'Edit User',
                    'description' => 'Modify existing user accounts',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null
                ],
                [
                    'code' => 'M-03-DEACTIVATE',
                    'name' => 'Deactivate User',
                    'description' => 'Deactivate user accounts',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null
                ]
            ],
            'Email' => [
                // Email Management Tab (parent)
                [
                    'code' => 'M-04-EMAIL',
                    'name' => 'Email Management',
                    'description' => 'Access to email composition and management features',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // Email Tab buttons (children of Email Management)
                [
                    'code' => 'M-04-COMPOSE',
                    'name' => 'Compose Email',
                    'description' => 'Create and send new emails',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-04-EMAIL'
                ],
                [
                    'code' => 'M-04-REPLY',
                    'name' => 'Reply',
                    'description' => 'Reply to email messages',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-04-EMAIL'
                ],
                [
                    'code' => 'M-04-FORWARD',
                    'name' => 'Forward',
                    'description' => 'Forward email messages',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-04-EMAIL'
                ],
                [
                    'code' => 'M-04-SPAM',
                    'name' => 'Mark as Spam',
                    'description' => 'Mark emails as spam/junk',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-04-EMAIL'
                ],
                // Email Template Tab (parent)
                [
                    'code' => 'M-04-TEMPLATE',
                    'name' => 'Email Template Management',
                    'description' => 'Access to email template creation and editing',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // Email Template Tab buttons (children of Email Template Management)
                [
                    'code' => 'M-04-SETUP-BANNER',
                    'name' => 'Setup Default Banner',
                    'description' => 'Configure default email template banners',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-04-TEMPLATE'
                ],
                [
                    'code' => 'M-04-PREVIEW',
                    'name' => 'Preview Template',
                    'description' => 'Preview email templates',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-04-TEMPLATE'
                ],
                [
                    'code' => 'M-04-EDIT-TEMPLATE',
                    'name' => 'Edit Template',
                    'description' => 'Modify email templates',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-04-TEMPLATE'
                ]
            ],
            'Document Management' => [
                // Transcript of Records Tab (parent)
                [
                    'code' => 'M-06-TRANSCRIPT',
                    'name' => 'Transcript of Records',
                    'description' => 'Access to transcript management features',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // Transcript of Records buttons (children)
                [
                    'code' => 'M-06-TRANSCRIPT-GENERATE',
                    'name' => 'Generate New Transcript',
                    'description' => 'Create new transcript documents',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-06-TRANSCRIPT'
                ],
                [
                    'code' => 'M-06-TRANSCRIPT-VIEW',
                    'name' => 'View Transcript of Records',
                    'description' => 'View existing transcript documents',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-06-TRANSCRIPT'
                ],
                [
                    'code' => 'M-06-TRANSCRIPT-REVOKE',
                    'name' => 'Revoke Transcript of Records',
                    'description' => 'Revoke transcript documents',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-06-TRANSCRIPT'
                ],
                // Certifications Tab (parent)
                [
                    'code' => 'M-06-CERTIFICATIONS',
                    'name' => 'Certifications',
                    'description' => 'Access to certification management features',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // Certifications buttons (children)
                [
                    'code' => 'M-06-CERT-GENERATE',
                    'name' => 'Generate New Certifications',
                    'description' => 'Create new certification documents',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-06-CERTIFICATIONS'
                ],
                [
                    'code' => 'M-06-CERT-VIEW',
                    'name' => 'View Certification',
                    'description' => 'View existing certification documents',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-06-CERTIFICATIONS'
                ],
                [
                    'code' => 'M-06-CERT-REVOKE',
                    'name' => 'Revoke Certification',
                    'description' => 'Revoke certification documents',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-06-CERTIFICATIONS'
                ],
                // Document Trackings Tab (parent)
                [
                    'code' => 'M-06-TRACKINGS',
                    'name' => 'Document Trackings',
                    'description' => 'Access to document tracking and monitoring',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // Document Trackings buttons (children)
                [
                    'code' => 'M-06-TRACKINGS-VIEW',
                    'name' => 'View Document Trackings',
                    'description' => 'View document status and tracking information',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-06-TRACKINGS'
                ]
            ],
            'Information Panel' => [
                // CMS Tab (parent)
                [
                    'code' => 'M-07-CMS',
                    'name' => 'CMS',
                    'description' => 'Access to content management system features',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // CMS buttons (children)
                [
                    'code' => 'M-07-CMS-ADD',
                    'name' => 'New Posting',
                    'description' => 'Create new CMS postings',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-07-CMS'
                ],
                [
                    'code' => 'M-07-CMS-EDIT',
                    'name' => 'Edit CMS',
                    'description' => 'Edit CMS postings and content',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-07-CMS'
                ],
                [
                    'code' => 'M-07-CMS-ARCHIVE',
                    'name' => 'Archive CMS',
                    'description' => 'Archive CMS postings',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-07-CMS'
                ],
                [
                    'code' => 'M-07-CMS-RESTORE',
                    'name' => 'Restore CMS',
                    'description' => 'Restore archived CMS postings',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-07-CMS'
                ],
                // Events Tab (parent)
                [
                    'code' => 'M-07-EVENTS',
                    'name' => 'Events',
                    'description' => 'Access to calendar and events management',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // Events buttons (children)
                [
                    'code' => 'M-07-EVENTS-ADD',
                    'name' => 'Add Event',
                    'description' => 'Create new calendar events',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-07-EVENTS'
                ],
                [
                    'code' => 'M-07-EVENTS-EDIT',
                    'name' => 'Edit Event',
                    'description' => 'Edit calendar events',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-07-EVENTS'
                ],
                [
                    'code' => 'M-07-EVENTS-ARCHIVE',
                    'name' => 'Archive Event',
                    'description' => 'Archive calendar events',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-07-EVENTS'
                ],
                [
                    'code' => 'M-07-EVENTS-RESTORE',
                    'name' => 'Restore Event',
                    'description' => 'Restore archived events',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-07-EVENTS'
                ]
            ],
            'System Configurations' => [
                // Users Tab (parent)
                [
                    'code' => 'M-09-USERS',
                    'name' => 'Users',
                    'description' => 'Access to user management features',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // Users buttons (children)
                [
                    'code' => 'M-09-USERS-ADD',
                    'name' => 'Add User',
                    'description' => 'Create new system users',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-USERS'
                ],
                [
                    'code' => 'M-09-USERS-EDIT',
                    'name' => 'Edit User',
                    'description' => 'Modify existing user accounts',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-USERS'
                ],
                [
                    'code' => 'M-09-USERS-DEACTIVATE',
                    'name' => 'Deactivate User',
                    'description' => 'Deactivate user accounts',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-USERS'
                ],
                // Titles Tab (parent)
                [
                    'code' => 'M-09-TITLES',
                    'name' => 'Titles',
                    'description' => 'Access to titles/courses management',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // Titles buttons (children)
                [
                    'code' => 'M-09-TITLES-ADD',
                    'name' => 'Add New Title',
                    'description' => 'Create new titles/courses',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-TITLES'
                ],
                [
                    'code' => 'M-09-TITLES-EDIT',
                    'name' => 'Edit Title',
                    'description' => 'Modify existing titles/courses',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-TITLES'
                ],
                [
                    'code' => 'M-09-TITLES-ARCHIVE',
                    'name' => 'Archive Title',
                    'description' => 'Archive titles/courses',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-TITLES'
                ],
                [
                    'code' => 'M-09-TITLES-RESTORE',
                    'name' => 'Restore Title',
                    'description' => 'Restore archived titles/courses',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-TITLES'
                ],
                // Roles and Permissions Tab (parent)
                [
                    'code' => 'M-09-ROLES',
                    'name' => 'Roles and Permissions',
                    'description' => 'Access to roles and permissions management',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // Roles buttons (children)
                [
                    'code' => 'M-09-ROLES-ADD',
                    'name' => 'Add New Role',
                    'description' => 'Create new user roles',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-ROLES'
                ],
                [
                    'code' => 'M-09-ROLES-MANAGE',
                    'name' => 'Manage Permissions',
                    'description' => 'Manage role permissions',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-ROLES'
                ],
                [
                    'code' => 'M-09-ROLES-EDIT',
                    'name' => 'Edit Role',
                    'description' => 'Modify existing roles',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-ROLES'
                ],
                [
                    'code' => 'M-09-ROLES-ARCHIVE',
                    'name' => 'Archive Role',
                    'description' => 'Archive user roles',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-ROLES'
                ],
                [
                    'code' => 'M-09-ROLES-RESTORE',
                    'name' => 'Restore Role',
                    'description' => 'Restore archived roles',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-ROLES'
                ],
                // Login Logs Tab (parent)
                [
                    'code' => 'M-09-LOGS',
                    'name' => 'Login Logs',
                    'description' => 'Access to login logs and audit trail',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // QR History Tab (parent)
                [
                    'code' => 'M-09-QR',
                    'name' => 'QR History',
                    'description' => 'Access to QR code generation history',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => null,
                    'is_tab' => true
                ],
                // QR History buttons (children)
                [
                    'code' => 'M-09-QR-EXPORT',
                    'name' => 'Export QR History',
                    'description' => 'Export QR code history data',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-QR'
                ],
                [
                    'code' => 'M-09-QR-VIEW',
                    'name' => 'View QR History',
                    'description' => 'View QR code details',
                    'enabled_for_superadmin' => true,
                    'parent_tab' => 'M-09-QR'
                ]
            ]
        ];

        // Process each module
        foreach ($moduleButtons as $moduleName => $buttons) {
            $module = Module::where('module_name', $moduleName)->first();
            
            if (!$module) {
                $this->command->warn("Module '{$moduleName}' not found, skipping...");
                continue;
            }

            $this->command->info("Processing detailed buttons for {$moduleName} module...");

            // Store parent button IDs for reference
            $parentButtons = [];

            // First pass: Create all parent buttons (tabs)
            foreach ($buttons as $buttonData) {
                if (isset($buttonData['is_tab']) && $buttonData['is_tab']) {
                    $moduleButton = ModuleButton::updateOrCreate([
                        'module_id' => $module->id,
                        'mod_button_code' => $buttonData['code'],
                    ], [
                        'mod_button_name' => $buttonData['name'],
                        'mod_button_description' => $buttonData['description'],
                        'parent_button_id' => null,
                        'is_tab' => true,
                        'created_by' => 1,
                        'updated_by' => 1,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);

                    $parentButtons[$buttonData['code']] = $moduleButton->id;

                    // Set permission for SUPERADMIN role
                    $status = $buttonData['enabled_for_superadmin'] ? 1 : 0;
                    
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
                    $this->command->info("  ✓ {$statusText} access to TAB: {$buttonData['name']}");
                }
            }

            // Second pass: Create child buttons with parent references
            foreach ($buttons as $buttonData) {
                if (!isset($buttonData['is_tab']) || !$buttonData['is_tab']) {
                    $parentButtonId = null;
                    
                    // Find parent button ID if this button has a parent
                    if ($buttonData['parent_tab'] && isset($parentButtons[$buttonData['parent_tab']])) {
                        $parentButtonId = $parentButtons[$buttonData['parent_tab']];
                    }

                    $moduleButton = ModuleButton::updateOrCreate([
                        'module_id' => $module->id,
                        'mod_button_code' => $buttonData['code'],
                    ], [
                        'mod_button_name' => $buttonData['name'],
                        'mod_button_description' => $buttonData['description'],
                        'parent_button_id' => $parentButtonId,
                        'is_tab' => false,
                        'created_by' => 1,
                        'updated_by' => 1,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);

                    // Set permission for SUPERADMIN role
                    $status = $buttonData['enabled_for_superadmin'] ? 1 : 0;
                    
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
                    $parentInfo = $parentButtonId ? " (under {$buttonData['parent_tab']})" : "";
                    $this->command->info("    ✓ {$statusText} access to BUTTON: {$buttonData['name']}{$parentInfo}");
                }
            }
        }

        $this->command->info('Detailed module buttons and permissions created successfully!');
    }
}