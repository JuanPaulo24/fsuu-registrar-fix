<?php

namespace App\Http\Controllers;

use App\Models\Posting;
use App\Traits\ChecksPermissions;
use Illuminate\Http\Request;

class PostingController extends Controller
{
    use ChecksPermissions;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Auto-update expired postings to inactive status
        $this->updateExpiredPostings();

        $data = Posting::select([
            '*'
        ]);

        $data->where(function ($query) use ($request) {
            if ($request->search) {
                $query->orWhere("title", 'LIKE', "%$request->search%")
                    ->orWhere("content", 'LIKE', "%$request->search%")
                    ->orWhere("type", 'LIKE', "%$request->search%")
                    ->orWhere("priority_level", 'LIKE', "%$request->search%")
                    ->orWhere("status", 'LIKE', "%$request->search%")
                    ->orWhere("start_date", 'LIKE', "%$request->search%")
                    ->orWhere("end_date", 'LIKE', "%$request->search%")
                    ->orWhere("target_audience_id", 'LIKE', "%$request->search%");
            }
        });

        if ($request->isTrash && ($request->isTrash === true || $request->isTrash === 'true')) {
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
        // Authorization check - add or edit CMS posting
        $isUpdate = !empty($request->id);
        $permissions = $isUpdate ? ['M-07-CMS-EDIT'] : ['M-07-CMS-ADD'];
        
        if ($response = $this->authorizeOrFail($permissions, "Unauthorized: You don't have permission to " . ($isUpdate ? "edit" : "create") . " CMS postings.")) {
            return $response;
        }

        $ret = [
            "success" => false,
            "message" => "Data not " . ($request->id ? "update" : "saved")
        ];

        // Base validation rules
        $rules = [
            'title' => 'required' . ($request->id ? '|unique:postings,title,' . $request->id : '|unique:postings,title'),
            'content' => 'required',
            'type' => 'required|in:notification,announcement,news',
            'status' => 'required|in:active,inactive',
            'startDate' => 'required|date',
            'endDate' => 'nullable|date|after_or_equal:startDate',
        ];

        // Conditional validation based on type
        if ($request->type === 'notification') {
            // For notifications: target audience is required, priority is not needed
            $rules['targetAudience'] = 'required|exists:user_roles,id';
        } else {
            // For announcements/news: priority is required, target audience is optional
            $rules['priority_level'] = 'required|in:high,medium,low';
            $rules['targetAudience'] = 'nullable|exists:user_roles,id';
        }

        // For new postings, start date must be today or future
        if (!$request->id) {
            $rules['startDate'] = 'required|date|after_or_equal:today';
        }

        try {
            $request->validate($rules);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = [];
            foreach ($e->errors() as $field => $messages) {
                $errors = array_merge($errors, $messages);
            }
            return response()->json([
                'success' => false,
                'message' => 'Validation failed: ' . implode(', ', $errors),
                'errors' => $e->errors()
            ], 422);
        }

        // Additional date validation
        if ($request->startDate && $request->endDate) {
            $startDate = \Carbon\Carbon::parse($request->startDate);
            $endDate = \Carbon\Carbon::parse($request->endDate);
            
            if ($endDate->lt($startDate)) {
                return response()->json([
                    'success' => false,
                    'message' => 'End date cannot be earlier than start date. Please check your dates.'
                ], 422);
            }
        }

        // Check if dates are in the past (only for new postings, not updates)
        if (!$request->id) { // Only for new postings
            $today = \Carbon\Carbon::today();
            
            if ($request->startDate && \Carbon\Carbon::parse($request->startDate)->startOf('day')->lt($today)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Start date cannot be in the past. Please select a current or future date.'
                ], 422);
            }
        }

        // Special validation for reactivating expired postings
        if ($request->id && $request->status === 'active') {
            $existingPosting = Posting::find($request->id);
            $today = \Carbon\Carbon::today();
            
            if ($existingPosting && $existingPosting->status === 'inactive') {
                // Check if the posting was inactive due to expiration (end date in the past)
                $wasExpired = $existingPosting->end_date && \Carbon\Carbon::parse($existingPosting->end_date)->lt($today);
                
                if ($wasExpired) {
                    // For expired postings being reactivated, ensure start date is current or future
                    $startDate = \Carbon\Carbon::parse($request->startDate)->startOf('day');
                    if ($request->startDate && $startDate->lt($today)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'To reactivate an expired posting, the start date must be current or in the future. Current date: ' . $today->format('Y-m-d') . ', Start date: ' . $startDate->format('Y-m-d')
                        ], 422);
                    }
                    
                    // Require end date when reactivating expired posting
                    if (!$request->endDate) {
                        return response()->json([
                            'success' => false,
                            'message' => 'When reactivating an expired posting, you must set a new end date.'
                        ], 422);
                    }
                }
            }
        }


        $data = [
            'title' => $request->title,
            'content' => $request->content,
            'type' => $request->type,
            'priority_level' => $request->priority_level,
            'status' => $request->status,
            'start_date' => $request->startDate,
            'end_date' => $request->endDate,
            'target_audience_id' => $request->targetAudience,
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


        $posting = Posting::updateOrCreate([
            "id" => $request->id,
        ], $data);

        if ($posting) {
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
        $data = Posting::find($id);

        return response()->json([
            'data' => $data,
            'success' => true
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function posting_archived(Request $request)
    {
        // Authorization check - archive or restore CMS posting
        $permissions = $request->isTrash ? ['M-07-CMS-RESTORE'] : ['M-07-CMS-ARCHIVE'];
        
        if ($response = $this->authorizeOrFail($permissions, "Unauthorized: You don't have permission to " . ($request->isTrash ? "restore" : "archive") . " CMS postings.")) {
            return $response;
        }

        $ret = [
            "success" => false,
            "message" => "Data failed to " . ($request->isTrash ? "restore" : "archive")
        ];

        if ($request->ids && count($request->ids) > 0) {
            if ($request->isTrash) {
                // Restore from archive
                Posting::whereIn("id", $request->ids)->restore();
                // Update the 'updated_by' field and set status back to active
                $data = [
                    "deleted_by" => null,
                    "updated_by" => auth()->id(),
                    "status" => "active", // Restore to active status
                ];
                Posting::whereIn("id", $request->ids)->update($data);
            } else {
                // Archive the posting
                $data = [
                    "deleted_at" => now(),
                    "deleted_by" => auth()->id(),
                    "status" => "inactive", // Set status to inactive when archiving
                ];
                Posting::whereIn("id", $request->ids)->update($data);
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
    public function update(Request $request, Posting $posting)
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

        $posting = Posting::find($id);


        if ($posting) {
            if ($posting->delete()) {

                $ret = [
                    "success" => true,
                    "message" => "Data deleted successfully"
                ];
            }
        }
        return response()->json($ret, 200);
    }

    /**
     * Get public postings (target_audience_id is null or empty)
     * This endpoint is accessible without authentication
     */
    public function getPublicPostings(Request $request)
    {
        // Auto-update expired postings to inactive status
        $this->updateExpiredPostings();

        $today = \Carbon\Carbon::today();
        
        $data = Posting::select([
            'id',
            'title',
            'content',
            'type',
            'priority_level',
            'status',
            'start_date',
            'end_date',
            'created_at',
            'updated_at'
        ])
        ->where('status', 'active')
        ->where(function ($query) {
            $query->whereNull('target_audience_id')
                  ->orWhere('target_audience_id', '');
        })
        ->where(function ($query) use ($today) {
            // Show active postings that haven't expired yet
            $query->where(function ($subQuery) use ($today) {
                $subQuery->whereNull('end_date') // No end date - always show if active
                         ->orWhereDate('end_date', '>=', $today); // Or end date is today or future
            });
        });

        // Search functionality
        if ($request->search) {
            $data->where(function ($query) use ($request) {
                $query->where("title", 'LIKE', "%{$request->search}%")
                      ->orWhere("content", 'LIKE', "%{$request->search}%")
                      ->orWhere("type", 'LIKE', "%{$request->search}%")
                      ->orWhere("priority_level", 'LIKE', "%{$request->search}%");
            });
        }

        // Filter by type (handle comma-separated values)
        if ($request->type && $request->type !== 'all') {
            if (strpos($request->type, ',') !== false) {
                // Handle comma-separated types like "announcement,news"
                $types = array_map('trim', explode(',', $request->type));
                $data->whereIn('type', $types);
            } else {
                // Handle single type
                $data->where('type', $request->type);
            }
        }

        // Filter by priority level
        if ($request->priority_level && $request->priority_level !== 'all') {
            $data->where('priority_level', $request->priority_level);
        }

        // Sorting
        if ($request->sort_field && $request->sort_order) {
            $allowedSortFields = ['id', 'title', 'type', 'priority_level', 'start_date', 'end_date', 'created_at'];
            $sortField = in_array($request->sort_field, $allowedSortFields) ? $request->sort_field : 'created_at';
            $sortOrder = in_array(strtolower($request->sort_order), ['asc', 'desc']) ? $request->sort_order : 'desc';
            $data->orderBy($sortField, $sortOrder);
        } else {
            // Default sorting: high priority first, then by start date descending
            $data->orderByRaw("CASE 
                WHEN priority_level = 'high' THEN 1 
                WHEN priority_level = 'medium' THEN 2 
                WHEN priority_level = 'low' THEN 3 
                ELSE 4 END")
                ->orderBy('start_date', 'desc')
                ->orderBy('created_at', 'desc');
        }

        // Pagination
        if ($request->page_size && $request->page_size > 0) {
            $pageSize = min($request->page_size, 100); // Limit max page size for performance
            $data = $data->paginate($pageSize, ['*'], 'page', $request->page ?? 1);
        } else {
            $data = $data->limit(50)->get(); // Default limit for performance
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Public postings retrieved successfully'
        ], 200);
    }

    /**
     * Automatically update expired postings to inactive status
     */
    private function updateExpiredPostings()
    {
        $today = \Carbon\Carbon::today();
        
        // Find active postings that have passed their end date
        $expiredPostings = Posting::where('status', 'active')
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', $today)
            ->get();

        if ($expiredPostings->count() > 0) {
            // Update expired postings to inactive
            Posting::where('status', 'active')
                ->whereNotNull('end_date')
                ->whereDate('end_date', '<', $today)
                ->update([
                    'status' => 'inactive',
                    'updated_by' => auth()->check() ? auth()->user()->id : null,
                    'updated_at' => now()
                ]);

            \Log::info("Auto-updated {$expiredPostings->count()} expired postings to inactive status");
        }
    }
}

