<?php

namespace App\Http\Controllers;

use App\Models\SchoolYear;
use Illuminate\Http\Request;

class SchoolYearController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = SchoolYear::select([
            '*'
        ]);

        $data->where(function ($query) use ($request) {
            if ($request->search) {
                $query->orWhere("semester", 'LIKE', "%$request->search%")
                    ->orWhere("start_date", 'LIKE', "%$request->search%")
                    ->orWhere("end_date", 'LIKE', "%$request->search%")
                    ->orWhere("status", 'LIKE', "%$request->search%");
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
            $data->orderBy('id', 'asc');
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

        $ret  = [
            "success" => false,
            "message" => "Data not " . ($request->id ? "update" : "saved")
        ];

        $request->validate([
            'semester' => 'required',
            'start_date' => 'required',
            'end_date' => 'required',
            'status' => 'required',
        ]);

        $data = [
            'semester' => $request->semester,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => $request->status,
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


        $schoolYear = SchoolYear::updateOrCreate([
            "id" => $request->id,
        ], $data);

        if ($schoolYear) {
            $ret  = [
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
        $data = SchoolYear::find($id);

        return response()->json([
            'data' => $data,
            'success' => true
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SchoolYear $schoolYear)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function signature_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data failed to " . ($request->isTrash ? "restore" : "archive")
        ];

        if ($request->ids && count($request->ids) > 0) {
            if ($request->isTrash) {
                SchoolYear::whereIn("id", $request->ids)->restore();
                // Update the 'updated_by' field
                $data = [
                    "deleted_by" => null,
                    "updated_by" => auth()->id(),
                ];
                SchoolYear::whereIn("id", $request->ids)->update($data);
            } else {
                $data = [
                    "deleted_at" => now(),
                    "deleted_by" => auth()->id(),
                ];
                SchoolYear::whereIn("id", $request->ids)->update($data);
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

        $schoolYear = SchoolYear::find($id);


        if ($schoolYear) {
            if ($schoolYear->delete()) {

                $ret = [
                    "success" => true,
                    "message" => "Data deleted successfully"
                ];
            }
        }
        return response()->json($ret, 200);
    }
}
