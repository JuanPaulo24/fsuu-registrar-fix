<?php

namespace App\Http\Controllers;

use App\Models\UserRole;
use App\Traits\ChecksPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserRoleController extends Controller
{
    use ChecksPermissions;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = UserRole::select([
            '*'
        ]);

        $data->where(function ($query) use ($request) {
            if ($request->search) {
                $query->orWhere("user_role", 'LIKE', "%$request->search%");
            }
        });

        if ($request->isTrash) {
            $data->onlyTrashed();
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $data->orderBy(isset($request->sort_field) ? $request->sort_field : 'id', isset($request->sort_order)  ? $request->sort_order : 'desc');
            }
        } else {
            $data->orderBy('id', 'desc');
        }

        if ($request->page_size) {
            $data = $data->limit($request->page_size)
                ->paginate($request->page_size, ['*'], 'page', $request->page)
                ->toArray();
        } else {
            $data = $data->get();
        }

        return response()->json([
            'success'   => true,
            'data'      => $data
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Authorization check - add or edit role
        $isUpdate = !empty($request->id);
        $permissions = $isUpdate ? ['M-09-ROLES-EDIT'] : ['M-09-ROLES-ADD'];
        
        if ($response = $this->authorizeOrFail($permissions, "Unauthorized: You don't have permission to " . ($isUpdate ? "edit" : "create") . " roles.")) {
            return $response;
        }

        $ret = [
            "success" => false,
            "message" => "Data not " . ($request->id ? "update" : "saved")
        ];

        $request->validate([
            'user_role' => 'required|unique:user_roles,user_role,' . $request->id,
        ]);


        $data = [
            'user_role' => $request->user_role,
        ];

        if ($request->id) {
            $data += [
                "updated_by" => auth()->user()->id
            ];
        } else {
            $data += [
                "created_by" => auth()->user()->id
            ];
        }


        $role = UserRole::updateOrCreate([
            "id" => $request->id,
        ], $data);

        if ($role) {
            $ret = [
                "success" => true,
                "message" => "Data " . ($request->id ? "updated" : "saved") . " successfully"
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $data = UserRole::find($id);

        return response()->json([
            'data' => $data,
            'success' => true
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserRole $role)
    {
        //
    }

    public function role_archived(Request $request)
    {
        // Authorization check - archive or restore role
        $permissions = $request->isTrash ? ['M-09-ROLES-RESTORE'] : ['M-09-ROLES-ARCHIVE'];
        
        if ($response = $this->authorizeOrFail($permissions, "Unauthorized: You don't have permission to " . ($request->isTrash ? "restore" : "archive") . " roles.")) {
            return $response;
        }

        $ret = [
            "success" => false,
            "message" => "Data failed to " . ($request->isTrash ? "restore" : "archive")
        ];

        if ($request->ids && count($request->ids) > 0) {
            if ($request->isTrash) {
                UserRole::whereIn("id", $request->ids)->restore();
                // Update the 'updated_by' field
                $data = [
                    "deleted_by" => null,
                    "updated_by" => auth()->id(),
                ];
                UserRole::whereIn("id", $request->ids)->update($data);
            } else {
                $data = [
                    "deleted_at" => now(),
                    "deleted_by" => auth()->id(),
                ];
                UserRole::whereIn("id", $request->ids)->update($data);
            }

            $ret = [
                "success" => true,
                "message" => "Data " . ($request->isTrash ? "restored" : "archived") . " successfully"
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ret = [
            "success" => false,
            "message" => "Data not deleted"
        ];

        $role = UserRole::find($id);


        if ($role) {
            if ($role->delete()) {

                $ret = [
                    "success" => true,
                    "message" => "Data deleted successfully"
                ];
            }
        }
        return response()->json($ret, 200);
    }

    /**
     * Check if a user role can be archived by checking for users assigned to it
     */
    public function usageCheck($id)
    {
        try {
            $userRole = UserRole::findOrFail($id);
            
            // Count users assigned to this role (excluding deactivated users)
            $usersCount = DB::table('users')
                ->where('user_role_id', $id)
                ->where('status', '!=', 'Deactivated')
                ->count();
            
            // Get user details if there are any
            $users = [];
            if ($usersCount > 0) {
                $users = DB::table('users')
                    ->leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
                    ->where('users.user_role_id', $id)
                    ->where('users.status', '!=', 'Deactivated')
                    ->select(
                        'users.id',
                        'users.email',
                        'users.username',
                        DB::raw("COALESCE(CONCAT(profiles.firstname, ' ', profiles.lastname), users.username) as name")
                    )
                    ->get()
                    ->toArray();
            }
            
            return response()->json([
                'canArchive' => $usersCount === 0,
                'usageCount' => $usersCount,
                'users' => $users,
                'message' => $usersCount > 0 
                    ? "Cannot archive role. {$usersCount} user(s) are currently assigned to this role."
                    : "Role can be archived."
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking role usage: ' . $e->getMessage()
            ], 500);
        }
    }
}
