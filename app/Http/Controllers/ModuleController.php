<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\User;
use App\Models\UserPermission;
use App\Models\UserRolePermission;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $dataQuery = Module::with(['module_buttons']);

        if ($request->system_id) {
            $dataQuery->where('system_id', $request->system_id);
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $dataQuery->orderBy(isset($request->sort_field) ? $request->sort_field : 'module_code', isset($request->sort_order)  ? $request->sort_order : 'asc');
            }
        } else {
            $dataQuery->orderBy('module_code', 'asc');
        }

        if ($request->page_size) {
            $data = $dataQuery->limit($request->page_size)
                ->paginate($request->page_size, ['*'], 'page', $request->page)
                ->toArray();

            $data['data'] = collect($data['data'])->map(function ($item) use ($request) {
                $item['module_buttons'] = collect($item['module_buttons'])->map(function ($button) use ($request) {
                    if ($request->tab_parent_active == 'UserRole') {
                        $userRolePermission = UserRolePermission::where('mod_button_id', $button['id'])->where('role', $request->role)->first();
                        $button['status'] = $userRolePermission  && $userRolePermission->status ? $userRolePermission->status : 0;
                    } else if ($request->tab_parent_active == 'Users') {
                        $userPermission = UserPermission::where('mod_button_id', $button['id'])->where('user_id', $request->user_id)->first();
                        $button['status'] = $userPermission  && $userPermission->status ? $userPermission->status : 0;
                    }

                    return $button;
                });
                return $item;
            });
        } else {
            $data = $dataQuery->get();
        }

        return response()->json([
            "success" => true,
            "data" => $data,
            "request" => $request->all()
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
        $ret = [
            "success" => false,
            "message" => "Module not " . ($request->id ? "updated" : "created"),
            "request" => $request->all()
        ];

        $dataModule = Module::updateOrCreate([
            "id" => $request->id ? $request->id : null
        ], [
            "module_code" => $request->module_code,
            "module_name" => $request->module_name,
            "description" => $request->description,
            "system_id"   => $request->system_id,
        ]);

        if ($dataModule) {
            if ($request->module_buttons) {
                foreach ($request->module_buttons as $key => $value) {
                    if (!empty($value['id'])) {
                        $existingButton = $dataModule->module_buttons()->findOrFail($value['id']);
                        $existingButton->update($value);
                    } else {
                        $dataModule->module_buttons()->create($value);
                    }
                }
            }

            $ret = [
                "success" => true,
                "message" => "Module " . ($request->id ? "updated" : "created"),
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Module  $module
     * @return \Illuminate\Http\Response
     */
    public function show(Module $module)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Module  $module
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Module $module)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Module  $module
     * @return \Illuminate\Http\Response
     */
    public function destroy(Module $module)
    {
        //
    }

    public function module_update_permission_status(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Status not change"
        ];

        if ($request->tab_parent_active == 'UserRole') {
            $request->validate([
                'mod_button_id' => 'required',
                'role' => 'required'
            ]);

            $userRolePermission = UserRolePermission::updateOrCreate([
                'mod_button_id' => $request->mod_button_id,
                'role' => $request->role
            ], [
                'mod_button_id' => $request->mod_button_id,
                'role' => $request->role,
                'status' => $request->status
            ]);

            if ($userRolePermission) {
                $users = User::where('role', $request->role)->get();
                foreach ($users as $key => $value) {
                    UserPermission::updateOrCreate([
                        'mod_button_id' => $request->mod_button_id,
                        'user_id' => $value->id
                    ], [
                        'mod_button_id' => $request->mod_button_id,
                        'user_id' => $value->id,
                        'status' => $request->status
                    ]);
                }

                $ret = [
                    "success" => true,
                    "message" => "Status change successfully"
                ];
            }
        } else {
            $request->validate([
                'mod_button_id' => 'required',
                'user_id' => 'required'
            ]);

            $userPermission = UserPermission::updateOrCreate([
                'mod_button_id' => $request->mod_button_id,
                'user_id' => $request->user_id
            ], [
                'mod_button_id' => $request->mod_button_id,
                'user_id' => $request->user_id,
                'status' => $request->status
            ]);

            if ($userPermission) {
                $ret = [
                    "success" => true,
                    "message" => "Status change successfully"
                ];
            }
        }

        $ret['req'] = $request->all();

        return response()->json($ret, 200);
    }

    public function module_multi_update_permission_status(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Status not change"
        ];

        if ($request->tab_parent_active == 'UserRole') {
            $request->validate([
                'module_buttons' => 'required|array',
                'role' => 'required'
            ]);

            $users = User::where('role', $request->role)->get();

            foreach ($request->module_buttons as $key => $value) {
                $userRolePermission = UserRolePermission::updateOrCreate([
                    'mod_button_id' => $value['id'],
                    'role' => $request->role
                ], [
                    'mod_button_id' => $value['id'],
                    'role' => $request->role,
                    'status' => $request->status
                ]);

                if ($userRolePermission) {
                    foreach ($users as $key2 => $value2) {
                        UserPermission::updateOrCreate([
                            'mod_button_id' => $value['id'],
                            'user_id' => $value2->id
                        ], [
                            'mod_button_id' => $value['id'],
                            'user_id' => $value2->id,
                            'status' => $request->status
                        ]);
                    }
                }
            }

            $ret = [
                "success" => true,
                "message" => "Status change successfully"
            ];
        } else {
            $request->validate([
                'module_buttons' => 'required|array',
                'user_id' => 'required'
            ]);

            foreach ($request->module_buttons as $key => $value) {
                UserPermission::updateOrCreate([
                    'mod_button_id' => $value['id'],
                    'user_id' => $request->user_id
                ], [
                    'mod_button_id' => $value['id'],
                    'user_id' => $request->user_id,
                    'status' => $request->status
                ]);
            }

            $ret = [
                "success" => true,
                "message" => "Status change successfully"
            ];
        }

        $ret['req'] = $request->all();

        return response()->json($ret, 200);
    }
}
