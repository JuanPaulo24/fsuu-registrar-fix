<?php

namespace App\Http\Controllers;

use App\Models\EventCategory;
use Illuminate\Http\Request;

class EventCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = EventCategory::select([
            '*'
        ]);

        $data->where(function ($query) use ($request) {
            if ($request->search) {
                $query->orWhere("category", 'LIKE', "%$request->search%")
                    ->orWhere("type", 'LIKE', "%$request->search%");
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
            'category' => 'required',
            'type' => 'required',
        ]);

        $existingEventCategory = EventCategory::withTrashed()
            ->where('category', $request->category)
            ->where('type', $request->type)
            ->where('id', '!=', $request->id)
            ->first();

        if ($existingEventCategory) {
            // If a similar category already exists (even if soft-deleted), return a conflict message
            return response()->json([
                'success' => false,
                'message' => 'This data has already been taken.'
            ], 400);
        }

        $data = [
            'category' => $request->category,
            'type' => $request->type,
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


        $event_category = EventCategory::updateOrCreate([
            "id" => $request->id,
        ], $data);

        if ($event_category) {
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
        $data = EventCategory::find($id);

        return response()->json([
            'data' => $data,
            'success' => true
        ], 200);
    }

    public function event_category_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data failed to " . ($request->isTrash ? "restore" : "archive")
        ];

        if ($request->ids && count($request->ids) > 0) {
            if ($request->isTrash) {
                EventCategory::whereIn("id", $request->ids)->restore();
                // Update the 'updated_by' field
                $data = [
                    "deleted_by" => null,
                    "updated_by" => auth()->id(),
                ];
                EventCategory::whereIn("id", $request->ids)->update($data);
            } else {
                $data = [
                    "deleted_at" => now(),
                    "deleted_by" => auth()->id(),
                ];
                EventCategory::whereIn("id", $request->ids)->update($data);
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

        $event_category = EventCategory::find($id);


        if ($event_category) {
            if ($event_category->delete()) {

                $ret = [
                    "success" => true,
                    "message" => "Data deleted successfully"
                ];
            }
        }
        return response()->json($ret, 200);
    }
}
