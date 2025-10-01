<?php

namespace App\Http\Controllers;

use App\Imports\FacultyImport;
use App\Imports\StudentSubjectImport;
use App\Models\Grade;
use App\Models\Profile;
use App\Models\ProfileDepartment;
use App\Models\SchoolYear;
use App\Models\Subject;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use DateTime;
use Illuminate\Http\Request;
use App\Traits\ChecksPermissions;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;

class ProfileController extends Controller
{
    use ChecksPermissions;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $fullname = "CONCAT(profiles.firstname, ' ', profiles.lastname)";
        $username = "(SELECT username FROM users WHERE users.id = profiles.user_id)";
        $email = "(SELECT email FROM users WHERE users.id = profiles.user_id)";
        $created_at_formatted = "DATE_FORMAT(profiles.created_at, '%m-%d-%Y')";
        $user_role = "(SELECT (SELECT role FROM user_roles WHERE user_roles.id = users.user_role_id) FROM users WHERE users.id = profiles.user_id)";
        $user_type = "(SELECT (SELECT type FROM user_roles WHERE user_roles.id = users.user_role_id) FROM users WHERE users.id = profiles.user_id)";
        $id_number_fullname = "CONCAT(COALESCE(profiles.id_number, ''), ' - ', $fullname)";

        $data = Profile::with([
            'user', // Add user relationship to access UUID
            'attachments' => function ($query) {
                $query->orderBy('id', 'desc');
            },
            'grades.subject',
            'grades.schoolYear',
            'issuedDocument' => function ($query) {
                $query->withTrashed()
                     ->with(['signature', 'attachments'])
                     ->orderBy('created_at', 'desc');
            },
        ])->select([
            "profiles.*",
            DB::raw("$fullname fullname"),
            DB::raw("$username username"),
            DB::raw("$email email"),
            DB::raw("$user_role user_role"),
            DB::raw("$created_at_formatted created_at_formatted"),
            DB::raw("$id_number_fullname id_number_fullname"),
            DB::raw("(SELECT course_name FROM courses WHERE courses.id = profiles.course_id) course_name"),
        ])
        ->join('users', 'profiles.user_id', '=', 'users.id')
        ->where('users.user_role_id', 2); // Filter only students (user_role_id = 2)

        if ($request->search) {
            $data->where(function ($query) use ($request, $fullname, $username, $created_at_formatted, $id_number_fullname) {
                $query->where(DB::raw("$fullname"), 'LIKE', "%$request->search%")
                      ->orWhere(DB::raw("$username"), 'LIKE', "%$request->search%")
                      ->orWhere(DB::raw("$id_number_fullname"), 'LIKE', "%$request->search%")
                      ->orWhere('firstname', 'LIKE', "%$request->search%")
                      ->orWhere('lastname', 'LIKE', "%$request->search%")
                      ->orWhere('middlename', 'LIKE', "%$request->search%")
                      ->orWhere('id_number', 'LIKE', "%$request->search%")
                      ->orWhere(DB::raw("$created_at_formatted"), 'LIKE', "%$request->search%")
                      ->orWhere('gender', 'LIKE', "%$request->search%")
                      ->orWhere('citizenship', 'LIKE', "%$request->search%")
                      ->orWhere('religion', 'LIKE', "%$request->search%")
                      ->orWhere('civil_status', 'LIKE', "%$request->search%")
                      ->orWhere('course', 'LIKE', "%$request->search%")
                      ->orWhere(DB::raw("(SELECT course_name FROM courses WHERE courses.id = profiles.course_id)"), 'LIKE', "%$request->search%")
                      ->orWhere('address', 'LIKE', "%$request->search%");
            });
        }

        if ($request->status == "Archived") {
            $data->onlyTrashed();
        }

        $find_profile_by_user_id = $this->find_profile_by_user_id(auth()->user()->id);

        if ($request->from) {
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                // Handle sorting for computed columns
                if ($request->sort_field === 'fullname') {
                    $data->orderByRaw("CONCAT(profiles.firstname, ' ', profiles.lastname) {$request->sort_order}");
                } else {
                    $data->orderBy($request->sort_field, $request->sort_order);
                }
            }
        } else {
            $data->orderBy('profiles.id', 'desc');
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
        // Authorization check - M-02-NEW for new profiles, M-02-VIEW for updates (profile editing is typically part of view)
        $isUpdate = !empty($request->id);
        $requiredPermission = $isUpdate ? ['M-02-VIEW'] : ['M-02-NEW'];
        
        if ($response = $this->authorizeOrFail($requiredPermission, "Unauthorized: You don't have permission to " . ($isUpdate ? "edit" : "create") . " profiles.")) {
            return $response;
        }

        $ret = [
            "success" => false,
            "message" => "Data not saved.",
        ];

        if (!$request->id) {
            $request->validate([
                'username' => [
                    'required',
                    Rule::unique('users'),
                ],
                'email' => [
                    'required',
                    Rule::unique('users'),
                ],
            ]);
        }

        if ($request->id) {
            $findProfile = Profile::find($request->id);
            if ($findProfile) {
                $autoGeneratedIdNumber = $findProfile->id_number ?? $this->generateUniqueIdNumber();
                
                $dataProfile = [
                    "firstname" => $request->firstname,
                    "middlename" => $request->middlename,
                    "lastname" => $request->lastname,
                    "name_ext" => $request->name_ext,
                    "id_number" => $autoGeneratedIdNumber,
                    "birthplace" => $request->birthplace,
                    "birthdate" => new DateTime($request->birthdate),
                    "gender" => $request->gender,
                    "citizenship" => $request->citizenship,
                    "religion" => $request->religion,
                    "civil_status" => $request->civil_status,
                    "address" => $request->address,
                    "father_name" => $request->father_name,
                    "mother_name" => $request->mother_name,
                    "spouse_name" => $request->spouse_name,
                    "course" => $request->course,
                    "course_id" => $request->course_id,
                    "elem_school" => $request->elem_school,
                    "elem_lastyearattened" => $request->elem_lastyearattened,
                    "junior_high_school" => $request->junior_high_school,
                    "junior_high_school_lastyearattened" => $request->junior_high_school_lastyearattened,
                    "senior_high_school" => $request->senior_high_school,
                    "senior_high_school_lastyearattened" => $request->senior_high_school_lastyearattened,
                    "updated_by" => auth()->user()->id,
                ];

                $findProfile->fill($dataProfile);
                if ($findProfile->save()) {
                    // Handle profile picture upload if provided
                    if ($request->hasFile('profile_picture')) {
                        $this->create_attachment($findProfile, $request->file('profile_picture'), [
                            "folder_name" => "profiles/profile-{$findProfile->id}/profile_pictures",
                            "file_description" => "Profile Picture",
                        ]);
                    }

                    $ret = [
                        "success" => true,
                        "message" => "Data updated successfully",
                        "profile_id" => $findProfile->id
                    ];
                }
            }
        } else {
            $usersInfo = [
                "user_role_id"  => 2, // Automatically assign student role
                "username"      => $request->username,
                "email"         => $request->email,
                "created_by"    => auth()->user()->id,
                "status"        => "Active",
            ];

            $createUser = User::create($usersInfo);

            if ($createUser) {
                $autoGeneratedIdNumber = $this->generateUniqueIdNumber();
                
                $dataProfile = [
                    "user_id" => $createUser->id,
                    "firstname" => $request->firstname,
                    "middlename" => $request->middlename,
                    "lastname" => $request->lastname,
                    "name_ext" => $request->name_ext,
                    "id_number" => $autoGeneratedIdNumber,
                    "birthplace" => $request->birthplace,
                    "birthdate" => new DateTime($request->birthdate),
                    "gender" => $request->gender,
                    "citizenship" => $request->citizenship,
                    "religion" => $request->religion,
                    "civil_status" => $request->civil_status,
                    "address" => $request->address,
                    "father_name" => $request->father_name,
                    "mother_name" => $request->mother_name,
                    "spouse_name" => $request->spouse_name,
                    "course" => $request->course,
                    "course_id" => $request->course_id,
                    "elem_school" => $request->elem_school,
                    "elem_lastyearattened" => $request->elem_lastyearattened,
                    "junior_high_school" => $request->junior_high_school,
                    "junior_high_school_lastyearattened" => $request->junior_high_school_lastyearattened,
                    "senior_high_school" => $request->senior_high_school,
                    "senior_high_school_lastyearattened" => $request->senior_high_school_lastyearattened,
                ];

                $findProfilByUserId = \App\Models\Profile::where('user_id', $createUser->id)->first();

                $profile_id = "";

                if ($findProfilByUserId) {
                    $profile_id = $findProfilByUserId->id;
                    $dataProfile["updated_by"] = auth()->user()->id;

                    $findProfilByUserIdUpdate = $findProfilByUserId->fill($dataProfile);
                    $findProfilByUserIdUpdate->save();

                    if ($request->hasFile('profile_picture')) {
                        $this->create_attachment($findProfilByUserId, $request->file('profile_picture'), [
                            "folder_name" => "profiles/profile-$profile_id/profile_pictures",
                            "file_description" => "Profile Picture",
                        ]);
                    }
                } else {
                    $dataProfile["created_by"] = auth()->user()->id;
                    $createProfile = \App\Models\Profile::create($dataProfile);

                    if ($createProfile) {
                        $profile_id = $createProfile->id;

                        // Generate grades for the new profile
                        $this->generateGradesForProfile($profile_id);

                        if ($request->hasFile('profile_picture')) {
                            $this->create_attachment($createProfile, $request->file('profile_picture'), [
                                "folder_name" => "profiles/profile-$profile_id/profile_pictures",
                                "file_description" => "Profile Picture",
                            ]);
                        }
                    }
                }

                $ret = [
                    "success" => true,
                    "message" => "Data saved successfully",
                    "profile_id" => $profile_id
                ];
            }
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Profile  $profile
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        // Authorization check - view profile permission
        if ($response = $this->authorizeOrFail(['M-02-VIEW'], "Unauthorized: You don't have permission to view student profiles.")) {
            return $response;
        }

        $data = Profile::with([
            'user',
            'attachments',
            'grades.subject',
            'grades.schoolYear',
            'issuedDocument' => function ($query) {
                $query->withTrashed()
                     ->with(['signature', 'attachments'])
                     ->orderBy('created_at', 'desc');
            },
        ])
            ->find($id);

        // Derive simple semester and school year labels based on the first related subject
        if ($data && $data->grades && $data->grades->isNotEmpty()) {
            $firstGrade = $data->grades->first();
            $subject = $firstGrade ? $firstGrade->subject : null;
            if ($subject) {
                // Map semester values to labels (only what was requested)
                $semesterMap = [
                    '1' => 'First Semester',
                    '2' => 'Second Semester',
                    'summer' => 'Summer',
                ];
                $data->semester = $semesterMap[$subject->semester] ?? $subject->semester;

                // Map school year strictly by subject year_level as specified
                $yearLevelToSchoolYear = [
                    1 => '2022-2023',
                    2 => '2023-2024',
                    3 => '2024-2025',
                    4 => '2025-2026',
                ];
                $data->school_year = $yearLevelToSchoolYear[intval($subject->year_level)] ?? null;
            }
        }

        return response()->json([
            'success'   => true,
            'data'      => $data
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Profile  $profile
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated",
        ];

        $data = $request->validate([
            'firstname' => 'required',
            'lastname' => 'required',
            'middlename' => 'required',
            'name_ext' => 'required',
            'birthdate' => 'required',
            'birthplace' => 'required',
            'id_number' => '',
            'citizenship' => '',
            'religion' => '',
            'civil_status' => '',
            'address' => '',
            'father_name' => '',
            'mother_name' => '',
            'spouse_name' => '',
            'course' => '',
            'course_id' => '',
            'elem_school' => '',
            'elem_lastyearattened' => '',
            'junior_high_school' => '',
            'junior_high_school_lastyearattened' => '',
            'senior_high_school' => '',
            'senior_high_school_lastyearattened' => '',
            'gender' => '',
        ]);

        $findProfile = Profile::find($id);

        if ($findProfile) {
            $findProfile->fill($data);
            if ($findProfile->save()) {
                $ret = [
                    "success" => true,
                    "message" => "Data updated successfully",
                ];
            }
        }

        return response()->json($ret, 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Profile  $profile
     * @return \Illuminate\Http\Response
     */
    public function destroy(Profile $profile)
    {
        //
    }

    public function profile_update(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated",
            "request" => $request->all(),
        ];

        $data = $request->validate([
            'firstname' => 'required',
            'lastname' => 'required',
            'middlename' => 'required',
            'name_ext' => 'required',
            'birthdate' => 'required',
            'birthplace' => 'required',
            'id_number' => '',
            'citizenship' => '',
            'religion' => '',
            'civil_status' => '',
            'address' => '',
            'father_name' => '',
            'mother_name' => '',
            'spouse_name' => '',
            'course' => '',
            'elem_school' => '',
            'elem_lastyearattened' => '',
            'junior_high_school' => '',
            'junior_high_school_lastyearattened' => '',
            'senior_high_school' => '',
            'senior_high_school_lastyearattened' => '',
            'gender' => '',
        ]);

        $findProfile = Profile::find($request->id);

        if ($findProfile) {
            $findProfile->fill($data);
            if ($findProfile->save()) {


                $ret = [
                    "success" => true,
                    "message" => "Data updated successfully",
                ];
            }
        }

        return response()->json($ret, 200);
    }


    public function profile_deactivate(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not deactivate"
        ];

        $findProfile = Profile::find($request->id);
        if ($findProfile) {
            $profileUpdate = $findProfile->fill([
                "deactivated_by" => auth()->user()->id,
                "deactivated_at" => now()
            ]);

            if ($profileUpdate->save()) {
                $findUser = User::find($findProfile->user_id);
                if ($findUser) {
                    $findUser->fill([
                        "deactivated_by" => auth()->user()->id,
                        "deactivated_at" => now()
                    ])->save();
                }

                $ret = [
                    "success" => true,
                    "message" => "Data deactivated successfully"
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function profile_data_consent(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Consent not saved"
        ];

        $findProfile = Profile::where("id", $request->id)->first();

        if ($findProfile) {
            $findProfile->fill([
                'data_consent' => is_array($request->data_consent) ? implode(', ', $request->data_consent) : $request->data_consent,
            ])->save();

            $ret = [
                "success" => true,
                "message" => "Consent updated successfully"
            ];
        } else {
            $ret = [
                "success" => false,
                "message" => "Profile not found"
            ];
        }

        return response()->json($ret, 200);
    }

    public function upload_signature(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Signature not save"
        ];

        $findProfile = Profile::where("user_id", $request->user_id)->first();

        if ($findProfile && $request->hasFile('signature')) {
            $create_attachment = $this->create_attachment($findProfile, $request->file('signature'), [
                "folder_name" => "profiles/profile-$findProfile->id/signature",
                "file_description" => "Signature",
            ]);

            if ($create_attachment) {
                $findProfileData = Profile::with([
                    "attachments" => function ($query) {
                        $query->orderBy("id", "desc");
                    }
                ])->find($findProfile->user_id);

                $ret = [
                    "success" => true,
                    "message" => "Signature save successfully",
                    "data" => $findProfileData
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function update_profile_photo(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Profile photo not updated"
        ];

        $findProfile = Profile::where("user_id", $request->user_id)->first();

        if ($findProfile && $request->hasFile('profile_picture')) {
            $create_attachment = $this->create_attachment($findProfile, $request->file('profile_picture'), [
                "folder_name" => "profiles/profile-$findProfile->id/profile_pictures",
                "file_description" => "Profile Picture",
            ]);

            if ($create_attachment) {
                $findProfileData = Profile::with([
                    "attachments" => function ($query) {
                        $query->orderBy("id", "desc");
                    }
                ])->find($findProfile->user_id);

                $ret = [
                    "success" => true,
                    "message" => "Signature save successfully",
                    "data" => $findProfileData
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function faculty_upload_excel(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not updated",
            "request" => $request->all()
        ];

        $request->validate([
            'file_excel' => 'required|mimes:xlsx,xls',
        ]);

        if ($request->hasFile('file_excel')) {
            $path = $request->file('file_excel');

            $import = new FacultyImport();
            Excel::import($import, $path);

            $ret = $import->getMessage();
        }

        return response()->json($ret);
    }

    private function generateUniqueIdNumber()
    {
        $baseId = 22100000000;
        $maxId = 22100001000;
        
        $lastProfile = Profile::whereNotNull('id_number')
            ->where('id_number', '>=', $baseId)
            ->where('id_number', '<=', $maxId)
            ->orderBy('id_number', 'desc')
            ->first();
        
        if (!$lastProfile) {
            return $baseId;
        }
        
        $nextId = intval($lastProfile->id_number) + 1;
        
        if ($nextId > $maxId) {
            throw new \Exception('ID number range exhausted. Cannot generate new ID.');
        }
        
        while (Profile::where('id_number', $nextId)->exists() && $nextId <= $maxId) {
            $nextId++;
        }
        
        if ($nextId > $maxId) {
            throw new \Exception('ID number range exhausted. Cannot generate new ID.');
        }
        
        return strval($nextId);
    }

    private function generateGradesForProfile($profileId)
    {
        // Get all subjects and school years
        $subjects = Subject::all();
        $schoolYears = SchoolYear::all();
        
        $gradesData = [];
        
        foreach ($subjects as $subject) {
            // Find matching school year based on semester
            $semesterMap = [
                '1' => '1st Semester',
                '2' => '2nd Semester', 
                'summer' => 'Summer'
            ];
            
            $semesterName = $semesterMap[$subject->semester] ?? '1st Semester';
            $schoolYear = $schoolYears->where('semester', $semesterName)->first();
            
            if ($schoolYear) {
                // Generate random grade between 1.0 and 2.9
                $gradeValue = $this->generateRandomGrade();
                
                $gradesData[] = [
                    'profile_id' => $profileId,
                    'subject_id' => $subject->id,
                    'school_year_id' => $schoolYear->id,
                    'grade' => $gradeValue,
                    'created_by' => auth()->user()->id,
                    'updated_by' => auth()->user()->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
        }
        
        // Batch insert all grades
        if (!empty($gradesData)) {
            Grade::insert($gradesData);
        }
    }

    private function generateRandomGrade()
    {
        // Generate grade between 1.0 and 2.9
        // Valid grades: 1.0, 1.1, 1.2, ..., 1.9, 2.0, 2.1, ..., 2.9
        $major = rand(1, 2); // 1 or 2
        $minor = rand(0, 9); // 0 to 9
        
        return floatval($major . '.' . $minor);
    }
}
