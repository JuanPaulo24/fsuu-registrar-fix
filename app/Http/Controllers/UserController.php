<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\ProfileContactInformation;
use App\Models\ProfileDepartment;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $fullname = "(SELECT " . $this->fullname . " FROM profiles WHERE profiles.user_id=users.id ORDER BY profiles.id LIMIT 1)";
        $created_at_formatted = "DATE_FORMAT(created_at, '%m-%d-%Y')";
        
        // Enhanced fullname with course code for registrar users
        $fullnameWithCourse = "(
            SELECT CASE 
                WHEN courses.course_code IS NOT NULL AND courses.course_code != '' 
                THEN CONCAT(" . $this->fullname . ", ', ', courses.course_code)
                ELSE " . $this->fullname . "
            END
            FROM profiles 
            LEFT JOIN courses ON profiles.course_id = courses.id 
            WHERE profiles.user_id = users.id 
            ORDER BY profiles.id LIMIT 1
        )";

        $data = User::with('userRole', 'profile.courseInfo')->select([
            "users.*",
            DB::raw("$fullname fullname"),
            DB::raw("$fullnameWithCourse fullname_with_course"),
            DB::raw("$created_at_formatted created_at_formatted"),
        ]);

        $data = $data->where(function ($query) use ($request, $fullname, $created_at_formatted) {
            if ($request->search) {
                $query->orWhere(DB::raw("$fullname"), 'LIKE', "%$request->search%");
                $query->orWhere(DB::raw("$created_at_formatted"), 'LIKE', "%$request->search%");
                $query->orWhere("email", 'LIKE', "%$request->search%");
            }
        });

        // Filter by specific user_role_id when provided (e.g., 3 for Registrar Staff)
        if ($request->user_role_id) {
            $data->where('user_role_id', $request->user_role_id);
        }

        // Exclude specific user ID if provided (useful for edit scenarios)
        if ($request->has("exclude_id") && !empty($request->exclude_id)) {
            $data->where('id', '!=', $request->exclude_id);
        }

        // Filter by user role name when provided (e.g., 'REGISTRAR STAFF')
        if ($request->user_role) {
            $data->whereHas('userRole', function ($query) use ($request) {
                $query->where('user_role', $request->user_role);
            });
        }

        // Filter by multiple user_role_ids when provided (e.g., 1,3 for Superadmin and Registrar Staff)
        if ($request->user_role_ids) {
            $roleIds = explode(',', $request->user_role_ids);
            $data->whereIn('user_role_id', $roleIds);
        }

        // Exclude specific user_role_ids when provided (e.g., 2 for Students)
        if ($request->exclude_user_role_ids) {
            $excludeRoleIds = explode(',', $request->exclude_user_role_ids);
            $data->whereNotIn('user_role_id', $excludeRoleIds);
        }

        // Exclude specific user roles when provided (e.g., 'STUDENT')
        if ($request->exclude_user_roles) {
            $excludeRoles = explode(',', $request->exclude_user_roles);
            $data->whereDoesntHave('userRole', function ($query) use ($excludeRoles) {
                $query->whereIn('user_role', $excludeRoles);
            });
        }

        if ($request->roles) {
            $roles = explode(',', $request->roles);
            $data = $data->whereIn("roles", $roles);
        }

        if ($request->status) {
            $data->where("status", $request->status);
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $data = $data->orderBy(isset($request->sort_field) ? $request->sort_field : 'id', isset($request->sort_order)  ? $request->sort_order : 'desc');
            }
        } else {
            $data = $data->orderBy("fullname", 'desc');
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
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $ret  = [
            "success" => false,
            "message" => "Data not " . ($request->id ? "update" : "saved")
        ];

        // Handle UUID vs ID - the frontend sends UUID in the 'id' field for updates
        $userUuid = $request->id && $request->id !== '' ? $request->id : null;
        $userId = null;
        $existingUser = null;

        // If we have a UUID, find the user and get the database ID
        if ($userUuid) {
            $existingUser = User::where('uuid', $userUuid)->first();
            if ($existingUser) {
                $userId = $existingUser->id;
            }
        }

        // Validation rules
        $validationRules = [
            "firstname" => "required",
            "lastname" => "required",
        ];

        // Add username and email validation only for new users
        if ($userId && $existingUser) {
            // This is an update - skip username/email validation since they're disabled in the form
            // The existing values will remain unchanged
        } else {
            // For new users, validate username and email
            $validationRules['username'] = [
                'required',
                Rule::unique('users'),
            ];
            $validationRules['email'] = [
                'required',
                'email',
                Rule::unique('users'),
            ];
        }

        $request->validate($validationRules);

        // Define restricted roles (executive positions limited to one user)
        $restrictedRoles = [
            4 => 'University Registrar',
            5 => 'Dean', 
            6 => 'University President',
            7 => 'Vice President for Academic Affairs and Research'
        ];

        // Check if the selected role is restricted
        if (isset($restrictedRoles[$request->user_role_id])) {
            $existingUserWithRole = User::where('user_role_id', $request->user_role_id)
                ->where('status', 'Active');
                
            // If updating, exclude the current user from the check
            if ($userId && $existingUser) {
                $existingUserWithRole->where('id', '!=', $userId);
            }
            
            $existingUserWithRole = $existingUserWithRole->first();
            
            if ($existingUserWithRole) {
                return response()->json([
                    'success' => false,
                    'message' => "This role can only be assigned to one user at a time. Please contact your system administrator if you need to reassign this role.",
                    'errors' => [
                        'user_role_id' => ["This role is currently assigned to another user. Only one person can hold this position."]
                    ]
                ], 422);
            }
        }

        $data = [
            "user_role_id" => $request->user_role_id,
            "status" => 'Active',
        ];

        // Handle username and email based on whether this is create or update
        if ($userId && $existingUser) {
            // For updates, don't update username/email since they're disabled in the form
            // The existing values will remain unchanged
        } else {
            // For new users, include username and email
            $data["username"] = $request->username;
            $data["email"] = $request->email;
        }

        // Only include password if it's provided (for create or password change)
        if ($request->password) {
            $data["password"] = Hash::make($request->password);
        }

        // Set role based on user_role_id
        if ($request->user_role_id) {
            $userRole = UserRole::find($request->user_role_id);
            if ($userRole) {
                $data["role"] = $userRole->user_role;
            }
        }

        if ($userId && $existingUser) {
            $data += [
                "updated_by" => Auth::id()
            ];
        } else {
            $data += [
                "created_by" => Auth::id()
            ];
        }

        // Use the correct identifier for updateOrCreate
        if ($userId && $existingUser) {
            // Update existing user by database ID
            $user = User::updateOrCreate([
                "id" => $userId,
            ], $data);
        } else {
            // Create new user
            $user = User::create($data);
        }

        if ($user) {
            $profile = Profile::updateOrCreate(
                ["user_id" => $user->id],
                [
                    "firstname" => $request->firstname,
                    "lastname" => $request->lastname,
                    "middlename" => $request->middlename,
                    "name_ext" => $request->name_ext,
                    "gender" => $request->gender,
                    "birthdate" => $request->birthdate,
                    "birthplace" => $request->birthplace,
                    "citizenship" => $request->citizenship,
                    "religion" => $request->religion,
                    "civil_status" => $request->civil_status,
                    "course" => $request->course,
                    "course_id" => $request->course_id,
                    "address" => $request->address,
                    "mother_name" => $request->mother_name,
                    "father_name" => $request->father_name,
                    "spouse_name" => $request->spouse_name,
                    "elem_school" => $request->elem_school,
                    "elem_lastyearattened" => $request->elem_lastyearattened,
                    "junior_high_school" => $request->junior_high_school,
                    "junior_high_school_lastyearattened" => $request->junior_high_school_lastyearattened,
                    "senior_high_school" => $request->senior_high_school,
                    "senior_high_school_lastyearattened" => $request->senior_high_school_lastyearattened,
                ]
            );

            if ($profile) {
                if ($request->file('profile_picture')) {
                    $this->create_attachment($profile, $request->file('profile_picture'), [
                        "folder_name" => "profiles/profile-$profile->id/profile_pictures",
                        "file_description" => "Profile Picture",
                    ]);
                }
            }


            $ret  = [
                "success" => true,
                "message" => "Data " . ($userId && $existingUser ? "updated" : "saved") . " successfully"
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function show(User $user)
    {
        $data = $user->load([
            "profile" => function ($query) {
                $query->with([
                    "attachments"
                    // "schoo_id" => function ($query6) {
                    //     $query6->orderBy("id", "desc");
                    // }
                ]);
            }
        ]);

        $ret = [
            "success" => true,
            "data" => $data
        ];

        return response()->json($ret, 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        $ret  = [
            "success" => false,
            "message" => "Data not deleted",
        ];

        if ($user->delete()) {
            $ret  = [
                "success" => true,
                "message" => "Data deleted successfully"
            ];
        }

        return response()->json($ret, 200);
    }

    public function users_update_email(Request $request)
    {
        $ret  = [
            "success" => true,
            "message" => "Email not updated",
        ];

        $data = User::find($request->id);

        if ($data) {
            $data = $data->fill(["email" => $request->email]);
            if ($data->save()) {
                $ret  = [
                    "success" => true,
                    "message" => "Email updated successfully"
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function users_update_password(Request $request)
    {
        $ret  = [
            "success" => false,
            "message" => "Password not updated",
        ];

        $data = User::find($request->id);

        if ($data) {
            $data = $data->fill(["password" => Hash::make($request->new_password)]);
            if ($data->save()) {
                $ret  = [
                    "success" => true,
                    "message" => "Password updated successfully"
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function users_info_update_password(Request $request)
    {
        $ret  = [
            "success" => false,
            "message" => "Password not updated",
        ];

        $data = User::find($request->id);

        if ($data) {
            if (Hash::check($request->old_password, $data->password)) {
                $data = $data->fill(["password" => Hash::make($request->new_password)]);
                if ($data->save()) {
                    $ret  = [
                        "success" => true,
                        "message" => "Password updated successfully"
                    ];
                }
            } else {
                $ret  = [
                    "success" => false,
                    "message" => "Old password did not match",
                ];
            }
        } else {
            $ret  = [
                "success" => false,
                "message" => "No found data",
            ];
        }

        return response()->json($ret, 200);
    }

    public function user_update_role(Request $request)
    {
        $ret  = [
            "success" => false,
            "message" => "User role not updated",
        ];

        $findUser = User::find($request->id);

        if ($findUser) {
            if ($findUser->status === 'Active') {
                $findUser = $findUser->fill(["role" => $request->type, "role" => $request->role]);
                if ($findUser->save()) {
                    $ret  = [
                        "success" => true,
                        "message" => "User role updated successfully"
                    ];
                }
            }
        }

        return response()->json($ret, 200);
    }

    public function user_deactivate(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not deactivate"
        ];

        $findUser = User::find($request->id);

        if ($findUser) {
            if ($findUser->status === 'Active') {
                // deactivate user
                $findUser->status = 'Deactivated';
                $findUser->deactivated_by = Auth::id();
                $findUser->deactivated_at = now();

                if ($findUser->save()) {
                    $findUserProfile = Profile::where('id', $findUser->id)->first();

                    if ($findUserProfile) {
                        $findUserProfile->deactivated_by = Auth::id();
                        $findUserProfile->deactivated_at = now();
                        $findUserProfile->save();
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Data deactivated successfully"
                    ];
                }
            }
        } else {
            $ret = [
                "success" => false,
                "message" => "Failed to deactivate data"
            ];
        }

        return response()->json($ret, 200);
    }

    public function multiple_archived_user(Request $request)
    {
        $ret = [
            'success' => false,
            'message' => 'Data not archived!',
            'data' => $request->ids
        ];

        if ($request->has('ids') && count($request->ids) > 0) {
            foreach ($request->ids as $key => $value) {
                $findUser = User::find($value);

                if ($findUser) {
                    if ($request->isTrash == 0) {
                        $findUser->fill([
                            'deactivated_by' => Auth::id(),
                            'deactivated_at' => now(),
                            'status' => 'Archived'
                        ])->save();
                    } else if ($request->isTrash == 1) {
                        $findUser->fill([
                            'deactivated_by' => NULL,
                            'deactivated_at' => NULL,
                            'status' => 'Active'
                        ])->save();
                    }
                }
            }

            $ret = [
                'success' => true,
                'message' => 'Data ' . ($request->isTrash == 1 ? 'activated ' : 'archived') . ' successfully!',
            ];
        }

        return response()->json($ret, 200);
    }

    public function user_profile_info()
    {
        $data = User::with([

            "profile" => function ($query) {
                $query->with([
                    "attachments" => function ($query1) {
                        $query1->orderBy("id", "desc")->limit(1);
                    },
                ]);
            }
        ])->find(Auth::id());

        return response()->json([
            "success" => true,
            "data" => $data
        ], 200);
    }

    public function user_profile_info_update(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Profile not updated",
        ];

        $user = User::find(Auth::id());

        if ($user) {
            // Update user info if provided
            $userData = [];
            if ($request->has('username') && $request->username) {
                $userData['username'] = $request->username;
            }
            if ($request->has('email') && $request->email) {
                $userData['email'] = $request->email;
            }

            if (!empty($userData)) {
                $user->fill($userData);
                $user->save();
            }

            // Update or create profile
            $profileData = [
                "firstname" => $request->firstname,
                "lastname" => $request->lastname,
                "middlename" => $request->middlename,
                "name_ext" => $request->name_ext,
                "gender" => $request->gender,
                "birthdate" => $request->birthdate,
                "birthplace" => $request->birthplace,
                "citizenship" => $request->citizenship,
                "religion" => $request->religion,
                "civil_status" => $request->civil_status,
                "course" => $request->course,
                "address" => $request->address,
                "mother_name" => $request->mother_name,
                "father_name" => $request->father_name,
                "spouse_name" => $request->spouse_name,
                "elem_school" => $request->elem_school,
                "elem_lastyearattened" => $request->elem_lastyearattened,
                "junior_high_school" => $request->junior_high_school,
                "junior_high_school_lastyearattened" => $request->junior_high_school_lastyearattened,
                "senior_high_school" => $request->senior_high_school,
                "senior_high_school_lastyearattened" => $request->senior_high_school_lastyearattened,
            ];

            $profile = Profile::updateOrCreate(
                ["user_id" => $user->id],
                $profileData
            );

            if ($profile) {
                $ret = [
                    "success" => true,
                    "message" => "Profile updated successfully"
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function existing_username(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not exist"
        ];

        $request->validate([
            'username' => 'required',
        ]);

        try {
            $findUsername = User::where("username", $request->username)->first();

            if ($findUsername) {

                $isActive = $findUsername->status !== 'Deactivated' ? true : false;

                if ($isActive === true) {
                    return response()->json([
                        "success" => true,
                        "message" => "User found",
                        "user_id" => $findUsername->id,
                    ], 200);
                } else {
                    return response()->json([
                        "success" => false,
                        "message" => "Username already exist but deactivated",
                        "user_id" => $findUsername->id,
                    ], 200);
                }
            }
        } catch (\Exception $e) {
            $ret = [
                "success" => false,
                "message" => "Data error: " . $e->getMessage(),
            ];
        }

        $ret += [
            "request" => $request->all()
        ];

        return response()->json($ret, 200);
    }

    /**
     * Get user's profile by user UUID
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function getUserProfile(User $user)
    {
        // Get the user's profile with the same detailed relationships as ProfileController
        $profile = $user->profile()->with([
            'user',
            'attachments',
            'grades.subject',
            'grades.schoolYear',
            'issuedDocument' => function ($query) {
                $query->withTrashed()
                     ->with(['signature', 'attachments'])
                     ->orderBy('created_at', 'desc');
            },
        ])->first();

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profile not found for this user'
            ], 404);
        }

        // Derive simple semester and school year labels based on the first related subject
        if ($profile && $profile->grades && $profile->grades->isNotEmpty()) {
            $firstGrade = $profile->grades->first();
            $subject = $firstGrade ? $firstGrade->subject : null;
            if ($subject) {
                // Map semester values to labels (only what was requested)
                $semesterMap = [
                    '1' => 'First Semester',
                    '2' => 'Second Semester',
                    'summer' => 'Summer',
                ];
                $profile->semester = $semesterMap[$subject->semester] ?? $subject->semester;

                // Map school year strictly by subject year_level as specified
                $yearLevelToSchoolYear = [
                    1 => '2022-2023',
                    2 => '2023-2024',
                    3 => '2024-2025',
                    4 => '2025-2026',
                ];
                $profile->school_year = $yearLevelToSchoolYear[intval($subject->year_level)] ?? null;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $profile
        ], 200);
    }
}
