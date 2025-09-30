<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\UserRolePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserRolePermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $dataQuery = Module::with([
            'module_buttons' => function ($query) use ($request) {
                $query->with([
                    "user_role_permissions" => function ($query) use ($request) {
                        $query->where("user_role_id", $request->user_role_id);
                    }
                ]);
            }
        ]);

        if ($request->has("system_id")) {
            $dataQuery->where('system_id', $request->system_id);
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $dataQuery->orderBy(isset($request->sort_field) ? $request->sort_field : 'id', isset($request->sort_order)  ? $request->sort_order : 'desc');
            }
        } else {
            $dataQuery->orderBy('id', 'desc');
        }

        if ($request->page_size) {
            $data = $dataQuery->limit($request->page_size)
                ->paginate($request->page_size, ['*'], 'page', $request->page)
                ->toArray();
        } else {
            $data = $dataQuery->get();
        }

        return response()->json([
            "success" => true,
            "data" => $data
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $ret  = [
            "success" => false,
            "message" => "Data not update"
        ];

        $findUserRolePermission = UserRolePermission::where("user_role_id", $request->user_role_id)
            ->where("mod_button_id", $request->mod_button_id)
            ->first();

        if ($findUserRolePermission) {
            $findUserRolePermissionUpdate = $findUserRolePermission->fill([
                "status" => $request->status,
            ])->save();

            if ($findUserRolePermissionUpdate) {
                $ret  = [
                    "success" => true,
                    "message" => "Data updated successfully"
                ];
            }
        } else {
            $createUserRolePermission = UserRolePermission::create([
                "user_role_id" => $request->user_role_id,
                "mod_button_id" => $request->mod_button_id,
                "status" => $request->status,
            ]);
            if ($createUserRolePermission) {
                $ret  = [
                    "success" => true,
                    "message" => "Data updated successfully"
                ];
            }
        }

        return response()->json($ret, 200);
    }

    /**
     * Batch update multiple permissions
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function batchUpdate(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "No permissions updated"
        ];

        try {
            $permissions = $request->permissions;
            
            if (!$permissions || !is_array($permissions)) {
                return response()->json([
                    "success" => false,
                    "message" => "Invalid permissions data"
                ], 400);
            }

            DB::transaction(function () use ($permissions) {
                foreach ($permissions as $permissionData) {
                    UserRolePermission::updateOrCreate([
                        'user_role_id' => $permissionData['user_role_id'],
                        'mod_button_id' => $permissionData['mod_button_id'],
                    ], [
                        'status' => $permissionData['status'],
                        'updated_by' => auth()->user()->id ?? 1,
                        'updated_at' => now()
                    ]);
                }
            });

            $ret = [
                "success" => true,
                "message" => "Permissions updated successfully",
                "updated_count" => count($permissions)
            ];
            
        } catch (\Exception $e) {
            $ret = [
                "success" => false,
                "message" => "Failed to update permissions: " . $e->getMessage()
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\UserRolePermission  $userRolePermission
     * @return \Illuminate\Http\Response
     */
    public function show(UserRolePermission $userRolePermission)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\UserRolePermission  $userRolePermission
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, UserRolePermission $userRolePermission)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\UserRolePermission  $userRolePermission
     * @return \Illuminate\Http\Response
     */
    public function destroy(UserRolePermission $userRolePermission)
    {
        //
    }
}
