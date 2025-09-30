<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\UserPermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserPermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $data = Module::with(["module_buttons"])->where("system_id", $request->system_id)->get();

        $data = $data->map(function ($item) use ($request) {
            $module_buttons = $item->module_buttons->map(function ($item2) use ($request) {
                $user_permissions = UserPermission::where("user_id", $request->user_id)
                    ->where("mod_button_id", $item2->id)
                    ->first();

                $status = 0;
                $user_permission_id = 0;

                if ($user_permissions) {
                    $status = $user_permissions->status;
                    $user_permission_id = $user_permissions->id;
                }

                $item2["status"] = $status;
                $item2["user_permission_id"] = $user_permission_id;

                return $item2;
            });

            $item["module_buttons"] = $module_buttons;

            return $item;
        });

        $ret = [
            "success" => false,
            "data" => $data
        ];

        return response()->json($ret, 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\UserPermission  $userPermission
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = Module::with(["module_buttons"])->get();

        $data = $data->map(function ($item) use ($id) {
            $module_buttons = $item->module_buttons->map(function ($item2) use ($id) {
                $user_permissions = UserPermission::where("user_id", $id)
                    ->where("mod_button_id", $item2->id)
                    ->first();

                $status = 0;
                $user_permission_id = 0;

                if ($user_permissions) {
                    $status = $user_permissions->status;
                    $user_permission_id = $user_permissions->id;
                }

                return [
                    "mod_button_id" => $item2->id,
                    "mod_button_code" => $item2->mod_button_code,
                    "mod_button_name" => $item2->mod_button_name,
                    "mod_button_description" => $item2->mod_button_description,
                    "status" => $status,
                    "user_permission_id" => $user_permission_id,
                ];
            });

            return [
                "id" => $item->id,
                "module_code" => $item->module_code,
                "module_name" => $item->module_name,
                "description" => $item->description,
                "module_buttons" => $module_buttons
            ];
        });

        $ret = [
            "success" => false,
            "data" => $data
        ];

        return response()->json($ret, 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\UserPermission  $userPermission
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, UserPermission $userPermission)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\UserPermission  $userPermission
     * @return \Illuminate\Http\Response
     */
    public function destroy(UserPermission $userPermission)
    {
        //
    }

    public function user_permission_status(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Status not change"
        ];

        $find = UserPermission::find($request->user_permission_id);

        if ($find) {
            $findUpdate = $find->fill(['status' => $request->status]);

            if ($findUpdate->save()) {
                $ret = [
                    "success" => true,
                    "message" => "Status changed successfully"
                ];
            }
        } else {
            UserPermission::create([
                'status' => $request->status,
                'user_id' => $request->user_id,
                'mod_button_id' => $request->mod_button_id,
                'created_by' => auth()->user()->id,
            ]);

            $ret = [
                "success" => true,
                "message" => "Status changed successfully"
            ];
        }

        return response()->json($ret, 200);
    }
}