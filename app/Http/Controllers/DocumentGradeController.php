<?php

namespace App\Http\Controllers;

use App\Models\DocumentGrade;
use Illuminate\Http\Request;

class DocumentGradeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = DocumentGrade::select([
            '*'
        ]);

        $data->where(function ($query) use ($request) {
            if ($request->search) {
                $query->orWhere("profile_id", 'LIKE', "%$request->search%")
                    ->orWhere("grade_id", 'LIKE', "%$request->search%")
                    ->orWhere("file_path", 'LIKE', "%$request->search%")
                    ->orWhere("file_name", 'LIKE', "%$request->search%")
                    ->orWhere("file_type", 'LIKE', "%$request->search%");
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
            'grade_id' => 'required',
            'file_path' => 'required',
            'file_name' => 'required',
            'file_type' => 'required',
        ]);

        $data = [
            'grade_id' => $request->grade_id,
            'file_path' => $request->file_path,
            'file_name' => $request->file_name,
            'file_type' => $request->file_type,
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


        $documentGrade = DocumentGrade::updateOrCreate([
            "id" => $request->id,
        ], $data);

        if ($documentGrade) {
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
        $data = DocumentGrade::find($id);

        return response()->json([
            'data' => $data,
            'success' => true
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DocumentGrade $documentGrade)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function document_grade_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data failed to " . ($request->isTrash ? "restore" : "archive")
        ];

        if ($request->ids && count($request->ids) > 0) {
            if ($request->isTrash) {
                DocumentGrade::whereIn("id", $request->ids)->restore();
                // Update the 'updated_by' field
                $data = [
                    "deleted_by" => null,
                    "updated_by" => auth()->id(),
                ];
                DocumentGrade::whereIn("id", $request->ids)->update($data);
            } else {
                $data = [
                    "deleted_at" => now(),
                    "deleted_by" => auth()->id(),
                ];
                DocumentGrade::whereIn("id", $request->ids)->update($data);
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

        $documentGrade = DocumentGrade::find($id);


        if ($documentGrade) {
            if ($documentGrade->delete()) {

                $ret = [
                    "success" => true,
                    "message" => "Data deleted successfully"
                ];
            }
        }
        return response()->json($ret, 200);
    }
}
