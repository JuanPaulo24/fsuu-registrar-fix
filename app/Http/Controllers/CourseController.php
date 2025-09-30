<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $data = Course::select([
            '*'
        ]);

        $data->where(function ($query) use ($request) {
            if ($request->search) {
                $query->where("course_name", 'LIKE', "%$request->search%")
                    ->orwhere("course_code", 'LIKE', "%$request->search%");
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
            'course_name' => 'required|unique:courses,course_name,' . $request->id,
            'course_code' => 'required|unique:courses,course_code,' . $request->id,
        ]);


        $data = [
            'course_name' => $request->course_name,
            'course_code' => $request->course_code,
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


        $course = Course::updateOrCreate([
            "id" => $request->id,
        ], $data);

        if ($course) {
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
        $data = Course::find($id);

        return response()->json([
            'data' => $data,
            'success' => true
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function service_type_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data failed to " . ($request->isTrash ? "restore" : "archive")
        ];

        if ($request->ids && count($request->ids) > 0) {
            if ($request->isTrash) {
                Course::whereIn("id", $request->ids)->restore();
                // Update the 'updated_by' field
                $data = [
                    "deleted_by" => null,
                    "updated_by" => auth()->id(),
                ];
                Course::whereIn("id", $request->ids)->update($data);
            } else {
                $data = [
                    "deleted_at" => now(),
                    "deleted_by" => auth()->id(),
                ];
                Course::whereIn("id", $request->ids)->update($data);
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
    public function update(Request $request, Course $course)
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

            $course = Course::find($id);


        if ($course) {
            if ($course->delete()) {

                $ret = [
                    "success" => true,
                    "message" => "Data deleted successfully"
                ];
            }
        }
        return response()->json($ret, 200);
    }

    /**
     * Check if a course can be archived by checking for users assigned to it
     */
    public function usageCheck($id)
    {
        try {
            $course = Course::findOrFail($id);
            
            // Count users assigned to this course (excluding deactivated users)
            $usersCount = DB::table('profiles')
                ->join('users', 'users.id', '=', 'profiles.user_id')
                ->where('profiles.course_id', $id)
                ->whereNull('profiles.deleted_at')
                ->whereNotNull('users.status')
                ->where('users.status', '!=', 'Deactivated')
                ->count();
            
            // Get user details if there are any
            $users = [];
            if ($usersCount > 0) {
                $users = DB::table('profiles')
                    ->join('users', 'users.id', '=', 'profiles.user_id')
                    ->where('profiles.course_id', $id)
                    ->whereNull('profiles.deleted_at')
                    ->whereNotNull('users.status')
                    ->where('users.status', '!=', 'Deactivated')
                    ->select(
                        'users.id',
                        'users.email',
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
                    ? "Cannot archive program. {$usersCount} user(s) are currently assigned to this program."
                    : "Program can be archived."
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking program usage. Please try again.'
            ], 500);
        }
    }
}

