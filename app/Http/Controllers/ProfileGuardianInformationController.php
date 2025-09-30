<?php

namespace App\Http\Controllers;

use App\Models\ProfileGuardianInformation;
use Illuminate\Http\Request;

class ProfileGuardianInformationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = ProfileGuardianInformation::select([
            '*'
        ]);

        $data->where(function ($query) use ($request) {
            if ($request->search) {
                $query->orWhere("type", 'LIKE', "%$request->search%")
                    ->orWhere("firstname", 'LIKE', "%$request->search%")
                    ->orWhere("lastname", 'LIKE', "%$request->search%")
                    ->orWhere("middlename", 'LIKE', "%$request->search%")
                    ->orWhere("address", 'LIKE', "%$request->search%")
                    ->orWhere("age", 'LIKE', "%$request->search%")
                    ->orWhere("birthdate", 'LIKE', "%$request->search%")
                    ->orWhere("gender", 'LIKE', "%$request->search%")
                    ->orWhere("email", 'LIKE', "%$request->search%");

            }
        });

        if ($request->isTrash) {
            $data->onlyTrashed();
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null' &&
                $request->sort_order != '' && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $data->orderBy(isset($request->sort_field) ? $request->sort_field : 'id', isset($request->sort_order) ? $request->sort_order : 'desc');
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
            'success' => true,
            'data' => $data
        ], 200);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $ret = [
            "success" => false,
            "message" => "Data not " . ($request->id ? "update" : "saved")
        ];

        $request->validate([
            'profile_id' => 'required',
            'type' => 'required',
            'firstname' => 'required',
            'lastname' => 'required',
            'middlename' => 'nullable',
            'address' => 'required',
            'age' => 'required',
            'birthdate' => 'required',
            'gender' => 'required',
            'email' => 'nullable|unique:profile_guardian_informations',
        ]);


        $data = [
            'profile_id' => $request->profile_id,
            'type' => $request->type,
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'middlename' => $request->middlename,
            'address' => $request->address,
            'age' => $request->age,
            'birthdate' => $request->birthdate,
            'email' => $request->email,
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


        $guardian = ProfileGuardianInformation::updateOrCreate([
            "id" => $request->id,
        ], $data);

        if ($guardian) {
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
        $data = ProfileGuardianInformation::with('profile')->find($id);

        return response()->json([
            'data' => $data,
            'success' => true
        ], 200);
    }

    public function profile_guardian_information_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data failed to " . ($request->isTrash ? "restore" : "archive")
        ];

        if ($request->ids && count($request->ids) > 0) {
            if ($request->isTrash) {
                ProfileGuardianInformation::whereIn("id", $request->ids)->restore();
                // Update the 'updated_by' field
                $data = [
                    "deleted_by" => null,
                    "updated_by" => auth()->id(),
                ];
                ProfileGuardianInformation::whereIn("id", $request->ids)->update($data);
            } else {
                $data = [
                    "deleted_at" => now(),
                    "deleted_by" => auth()->id(),
                ];
                ProfileGuardianInformation::whereIn("id", $request->ids)->update($data);
            }

            $ret = [
                "success" => true,
                "message" => "Data " . ($request->isTrash ? "restored" : "archived") . " successfully"
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        //
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

        $guardian = ProfileGuardianInformation::find($id);


        if ($guardian) {
            if ($guardian->delete()) {

                $ret = [
                    "success" => true,
                    "message" => "Data deleted successfully"
                ];
            }
        }
        return response()->json($ret, 200);
    }
}
