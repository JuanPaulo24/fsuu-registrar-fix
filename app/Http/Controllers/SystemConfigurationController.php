<?php

namespace App\Http\Controllers;

use App\Models\SchoolYear;
use App\Models\User;
use App\Models\UserRole;
use App\Models\UserRolePermission;
use App\Models\Module;
use App\Models\ModuleButton;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class SystemConfigurationController extends Controller
{
    /**
     * Get all system configuration settings
     */
    public function index()
    {
        try {
            $config = [
                'authentication' => [
                    'twoFactorEnabled' => (bool) Cache::get('system_setting_authentication_twoFactorEnabled', false),
                    'passwordComplexity' => (bool) Cache::get('system_setting_authentication_passwordComplexity', true),
                    'sessionSecurity' => (bool) Cache::get('system_setting_authentication_sessionSecurity', true),
                    'loginAttempts' => (bool) Cache::get('system_setting_authentication_loginAttempts', true),
                    'accountLockout' => (bool) Cache::get('system_setting_authentication_accountLockout', true),
                ],
                'notifications' => [
                    'emailNotifications' => (bool) Cache::get('system_setting_notifications_emailNotifications', true),
                    'smsNotifications' => (bool) Cache::get('system_setting_notifications_smsNotifications', false),
                    'inAppNotifications' => (bool) Cache::get('system_setting_notifications_inAppNotifications', true),
                ],
                'timezone' => [
                    'timezone' => Cache::get('system_setting_timezone_timezone', 'Asia/Manila'),
                    'dateFormat' => Cache::get('system_setting_timezone_dateFormat', 'MM/DD/YYYY'),
                    'timeFormat' => Cache::get('system_setting_timezone_timeFormat', '12h'),
                    'language' => Cache::get('system_setting_timezone_language', 'en'),
                ],
                'session' => [
                    'sessionTimeout' => (int) Cache::get('system_setting_session_sessionTimeout', 30),
                    'autoLogout' => (bool) Cache::get('system_setting_session_autoLogout', true),
                    'sessionTracking' => (bool) Cache::get('system_setting_session_sessionTracking', true),
                ],
                'maintenance' => [
                    'maintenanceMode' => (bool) Cache::get('system_setting_maintenance_maintenanceMode', false),
                    'allowAdminAccess' => (bool) Cache::get('system_setting_maintenance_allowAdminAccess', true),
                    'autoBackup' => (bool) Cache::get('system_setting_maintenance_autoBackup', true),
                    'backupFrequency' => Cache::get('system_setting_maintenance_backupFrequency', 'daily'),
                ],
                'display' => [
                    'showVersionInfo' => (bool) Cache::get('system_setting_display_showVersionInfo', true),
                    'showBuildNumber' => (bool) Cache::get('system_setting_display_showBuildNumber', false),
                    'darkMode' => (bool) Cache::get('system_setting_display_darkMode', false),
                ],
                'security' => [
                    'auditLogging' => (bool) Cache::get('system_setting_security_auditLogging', true),
                    'roleBasedAccess' => (bool) Cache::get('system_setting_security_roleBasedAccess', true),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $config
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve system configuration',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update system configuration settings
     */
    public function update(Request $request)
    {
        try {
            DB::beginTransaction();

            $settings = $request->all();

            // Save each setting to cache/database
            foreach ($settings as $category => $categorySettings) {
                if (is_array($categorySettings)) {
                    foreach ($categorySettings as $key => $value) {
                        $settingKey = $category . '_' . $key;
                        // In a real application, you would save to a settings table
                        Cache::put("system_setting_{$settingKey}", $value, now()->addDays(365));
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'System configuration updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update system configuration',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all roles with permissions
     */
    public function getRoles()
    {
        try {
            $roles = UserRole::select('id', 'role as name', 'description', 'type')
                ->withCount(['users' => function($query) {
                    $query->whereNull('deleted_at');
                }])
                ->get()
                ->map(function ($role) {
                    // Get permissions for this role
                    $permissions = UserRolePermission::where('role', $role->name)
                        ->join('module_buttons', 'user_role_permissions.mod_button_id', '=', 'module_buttons.id')
                        ->where('user_role_permissions.status', 1)
                        ->pluck('module_buttons.mod_button_code')
                        ->toArray();

                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'description' => $role->description ?: 'No description provided',
                        'type' => $role->type ?: 'staff',
                        'permissions' => $permissions,
                        'userCount' => $role->users_count ?: 0,
                        'status' => 'active'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new role
     */
    public function createRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:user_roles,role',
            'description' => 'nullable|string|max:500',
            'type' => 'required|in:super_admin,admin,faculty,staff,student'
        ]);

        try {
            DB::beginTransaction();

            $role = UserRole::create([
                'role' => $request->name,
                'description' => $request->description,
                'type' => $request->type,
                'status' => 'active'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'data' => $role
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a role
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:user_roles,role,' . $id,
            'description' => 'nullable|string|max:500',
            'type' => 'required|in:super_admin,admin,faculty,staff,student'
        ]);

        try {
            DB::beginTransaction();

            $role = UserRole::findOrFail($id);
            $role->update([
                'role' => $request->name,
                'description' => $request->description,
                'type' => $request->type
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => $role
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a role
     */
    public function deleteRole($id)
    {
        try {
            DB::beginTransaction();

            $role = UserRole::findOrFail($id);
            
            // Check if role is being used by users
            $userCount = User::where('user_role_id', $id)->count();
            if ($userCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete role. It is currently assigned to ' . $userCount . ' user(s).'
                ], 400);
            }

            // Delete role permissions
            UserRolePermission::where('role', $role->role)->delete();
            
            // Delete role
            $role->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all permissions
     */
    public function getPermissions()
    {
        try {
            $permissions = ModuleButton::select('id', 'mod_button_code as key', 'mod_button_name as title')
                ->get()
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => $permissions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update role permissions
     */
    public function updateRolePermissions(Request $request, $roleId)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string'
        ]);

        try {
            DB::beginTransaction();

            $role = UserRole::findOrFail($roleId);
            
            // Remove existing permissions
            UserRolePermission::where('role', $role->role)->delete();

            // Add new permissions
            foreach ($request->permissions as $permission) {
                $moduleButton = ModuleButton::where('mod_button_code', $permission)->first();
                if ($moduleButton) {
                    UserRolePermission::create([
                        'role' => $role->role,
                        'mod_button_id' => $moduleButton->id,
                        'status' => 1
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Role permissions updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get academic years
     */
    public function getAcademicYears()
    {
        try {
            $academicYears = SchoolYear::select('id', 'year', 'start_date as startDate', 'end_date as endDate', 'is_active as isActive', 'status')
                ->orderBy('year', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $academicYears
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve academic years',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create academic year
     */
    public function createAcademicYear(Request $request)
    {
        $request->validate([
            'year' => 'required|string|unique:school_years,year',
            'startDate' => 'required|date',
            'endDate' => 'required|date|after:startDate'
        ]);

        try {
            DB::beginTransaction();

            $academicYear = SchoolYear::create([
                'year' => $request->year,
                'start_date' => $request->startDate,
                'end_date' => $request->endDate,
                'is_active' => false,
                'status' => 'upcoming'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Academic year created successfully',
                'data' => $academicYear
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create academic year',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
