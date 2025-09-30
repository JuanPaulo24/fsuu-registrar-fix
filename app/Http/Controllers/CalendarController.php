<?php

namespace App\Http\Controllers;

use App\Models\Calendar;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Auto-update expired events to inactive status
        $this->updateExpiredEvents();

        $data = Calendar::select([
            '*'
        ]);

        $data->where(function ($query) use ($request) {
            if ($request->search) {
                $query->orWhere("event_title", 'LIKE', "%$request->search%")
                    ->orWhere("event_description", 'LIKE', "%$request->search%")
                    ->orWhere("status", 'LIKE', "%$request->search%")
                    ->orWhere("start_date", 'LIKE', "%$request->search%")
                    ->orWhere("end_date", 'LIKE', "%$request->search%")
                    ->orWhere("event_type", 'LIKE', "%$request->search%");
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
            'event_title' => 'required|unique:calendars,event_title,' . $request->id,
            'event_description' => 'required',
            'status' => 'required|in:active,inactive',
            'event_type' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        // Additional date validation
        if ($request->start_date && $request->end_date) {
            $startDate = \Carbon\Carbon::parse($request->start_date);
            $endDate = \Carbon\Carbon::parse($request->end_date);
            
            if ($endDate->lt($startDate)) {
                return response()->json([
                    'success' => false,
                    'message' => 'End date cannot be earlier than start date. Please check your dates.'
                ], 422);
            }
        }

        // Special validation for reactivating expired events
        if ($request->id && $request->status === 'active') {
            $existingEvent = Calendar::find($request->id);
            $today = \Carbon\Carbon::today();
            
            if ($existingEvent && $existingEvent->status === 'inactive') {
                // Check if the event was inactive due to expiration (end date in the past)
                $wasExpired = $existingEvent->end_date && \Carbon\Carbon::parse($existingEvent->end_date)->lt($today);
                
                if ($wasExpired) {
                    // For expired events being reactivated, ensure start date is current or future
                    $startDate = \Carbon\Carbon::parse($request->start_date)->startOf('day');
                    if ($request->start_date && $startDate->lt($today)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'To reactivate an expired event, the start date must be current or in the future. Current date: ' . $today->format('Y-m-d') . ', Start date: ' . $startDate->format('Y-m-d')
                        ], 422);
                    }
                    
                    // Require end date when reactivating expired event
                    if (!$request->end_date) {
                        return response()->json([
                            'success' => false,
                            'message' => 'When reactivating an expired event, you must set a new end date.'
                        ], 422);
                    }
                }
            }
        }


        $data = [
            'event_title' => $request->event_title,
            'event_description' => $request->event_description,
            'status' => $request->status,
            'event_type' => $request->event_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
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


        $calendar = Calendar::updateOrCreate([
            "id" => $request->id,
        ], $data);

        if ($calendar) {
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
        $data = Calendar::find($id);

        return response()->json([
            'data' => $data,
            'success' => true
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function calendar_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data failed to " . ($request->isTrash ? "restore" : "archive")
        ];

        if ($request->ids && count($request->ids) > 0) {
            if ($request->isTrash) {
                // Restore from archive
                Calendar::whereIn("id", $request->ids)->restore();
                // Update the 'updated_by' field and set status back to active
                $data = [
                    "deleted_by" => null,
                    "updated_by" => auth()->id(),
                    "status" => "active", // Restore to active status
                ];
                Calendar::whereIn("id", $request->ids)->update($data);
            } else {
                // Archive the event
                $data = [
                    "deleted_at" => now(),
                    "deleted_by" => auth()->id(),
                    "status" => "inactive", // Set status to inactive when archiving
                ];
                Calendar::whereIn("id", $request->ids)->update($data);
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
    public function update(Request $request, Calendar $calendar)
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

        $calendar = Calendar::find($id);


        if ($calendar) {
            if ($calendar->delete()) {

                $ret = [
                    "success" => true,
                    "message" => "Data deleted successfully"
                ];
            }
        }
        return response()->json($ret, 200);
    }

    /**
     * Automatically update expired events to inactive status
     */
    private function updateExpiredEvents()
    {
        $today = \Carbon\Carbon::today();
        
        // Find active events that have passed their end date
        $expiredEvents = Calendar::where('status', 'active')
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', $today)
            ->get();

        if ($expiredEvents->count() > 0) {
            // Update expired events to inactive
            Calendar::where('status', 'active')
                ->whereNotNull('end_date')
                ->whereDate('end_date', '<', $today)
                ->update([
                    'status' => 'inactive',
                    'updated_by' => auth()->check() ? auth()->user()->id : null,
                    'updated_at' => now()
                ]);

            \Log::info("Auto-updated {$expiredEvents->count()} expired events to inactive status");
        }
    }
}

