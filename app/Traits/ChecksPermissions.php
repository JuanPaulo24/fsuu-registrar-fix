<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

trait ChecksPermissions
{
    /**
     * Check if the current user has a specific permission
     * 
     * @param string|array $permissionCodes Single permission code or array of codes (checks if user has ANY of them)
     * @return bool
     */
    protected function hasPermission($permissionCodes)
    {
        $user = Auth::user();
        if (!$user) {
            return false;
        }

        // Convert single permission to array for uniform handling
        $codes = is_array($permissionCodes) ? $permissionCodes : [$permissionCodes];

        $permission = DB::table('module_buttons')
            ->join('user_role_permissions', 'module_buttons.id', '=', 'user_role_permissions.mod_button_id')
            ->where('user_role_permissions.user_role_id', $user->user_role_id)
            ->whereIn('module_buttons.mod_button_code', $codes)
            ->where('user_role_permissions.status', 1)
            ->first();

        return $permission !== null;
    }

    /**
     * Return unauthorized JSON response
     * 
     * @param string $message
     * @param int $statusCode
     * @return \Illuminate\Http\JsonResponse
     */
    protected function unauthorizedResponse($message = 'Unauthorized action.', $statusCode = 403)
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], $statusCode);
    }

    /**
     * Check permission or return unauthorized response
     * 
     * @param string|array $permissionCodes
     * @param string|null $customMessage
     * @return \Illuminate\Http\JsonResponse|null Returns response if unauthorized, null if authorized
     */
    protected function authorizeOrFail($permissionCodes, $customMessage = null)
    {
        if (!$this->hasPermission($permissionCodes)) {
            $message = $customMessage ?? 'Unauthorized: You don\'t have permission to perform this action.';
            return $this->unauthorizedResponse($message);
        }
        
        return null;
    }
}
