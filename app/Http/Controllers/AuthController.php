<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $ret = [
            'success' => false,
            'message' => 'Unrecognized username or password. <b>Forgot your password?</b>',
        ];

        $credentialsEmail = [
            'email' => $request->email,
            'password' => $request->password
        ];

        if (auth()->attempt($credentialsEmail)) {
            $user = auth()->user();
            $token = $user->createToken(date('Y') . '-' . env('APP_NAME'))->accessToken;
            $login_data = $this->login_data($request, $user);

            if ($user->status == 'Active') {
                // Check if user has any accessible modules/permissions
                $accessibleModules = $login_data['accessible_modules'] ?? collect([]);
                
                if ($accessibleModules->isEmpty()) {
                    // Log failed login due to no permissions
                    LoginLogController::logAttempt($request->email, 'FAILED', $user->id, 'No permissions assigned');
                    
                    $ret = [
                        'success' => false,
                        'message' => 'Your account has no assigned permissions. Please contact the system administrator.',
                    ];
                } else {
                    // Log successful login
                    LoginLogController::logAttempt($request->email, 'SUCCESS', $user->id);
                    
                    $ret = [
                        'success' => true,
                        'data' => $login_data,
                        'token' => $token,
                    ];
                }
            } else {
                // Log failed login due to inactive account
                LoginLogController::logAttempt($request->email, 'FAILED', $user->id, 'Account deactivated');
                
                $ret = [
                    'success' => false,
                    'message' => 'Your account is deactivated. Please contact the administrator.',
                ];
            }
        } else {
            $credentialsUsername = [
                'username' => $request->email,
                'password' => $request->password
            ];

            if (auth()->attempt($credentialsUsername)) {
                $user = auth()->user();
                $token = $user->createToken(date('Y') . '-' . env('APP_NAME'))->accessToken;
                $login_data = $this->login_data($request, $user);

                if ($user->status == 'Active') {
                    // Check if user has any accessible modules/permissions
                    $accessibleModules = $login_data['accessible_modules'] ?? collect([]);
                    
                    if ($accessibleModules->isEmpty()) {
                        // Log failed login due to no permissions
                        LoginLogController::logAttempt($request->email, 'FAILED', $user->id, 'No permissions assigned');
                        
                        $ret = [
                            'success' => false,
                            'message' => 'Your account has no assigned permissions. Please contact the system administrator.',
                        ];
                    } else {
                        // Log successful login
                        LoginLogController::logAttempt($request->email, 'SUCCESS', $user->id);
                        
                        $ret = [
                            'success' => true,
                            'data' => $login_data,
                            'token' => $token,
                        ];
                    }
                } else {
                    // Log failed login due to inactive account
                    LoginLogController::logAttempt($request->email, 'FAILED', $user->id, 'Account deactivated');
                    
                    $ret = [
                        'success' => false,
                        'message' => 'Your account is deactivated. Please contact the administrator.',
                    ];
                }
            } else {
                // Log failed login due to invalid credentials
                LoginLogController::logAttempt($request->email, 'FAILED', null, 'Invalid credentials');
                
                $ret = [
                    'success' => false,
                    'message' => 'Unrecognized username or password. <b>Forgot your password?</b>',
                ];
            }
        }

        return response()->json($ret, 200);
    }

    public function forgotPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email'
            ]);

            $user = User::where('email', $request->email)
                      ->orWhere('username', $request->email)
                      ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'If this email exists in our system, you will receive a password reset link.'
                ], 200);
            }

            // TODO: Implement email sending for password reset
            // For now, just return a success message
            return response()->json([
                'success' => true,
                'message' => 'If this email exists in our system, you will receive a password reset link.'
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a valid email address.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Forgot password error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred. Please try again later.'
            ], 500);
        }
    }

    public function login_data($request, $user)
    {
        $dataProfile = \App\Models\Profile::with(["attachments" => function ($q) {
            return $q->orderBy("id", "desc");
        }])->firstWhere("user_id", $user->id);

        $profile_id = "";
        $firstname = "";
        $lastname = "";
        $profile_picture = "";

        if ($dataProfile) {
            $profile_id = $dataProfile->id ?? null;
            $firstname = $dataProfile->firstname ?? null;
            $lastname = $dataProfile->lastname ?? null;

            if ($dataProfile->attachments) {
                $profile_picture = $dataProfile->attachments->first()->file_path ?? null;
            }
        }

        // Get user's accessible modules based on role permissions
        $accessibleModules = $this->getUserAccessibleModules($user->user_role_id);
        
        // Get detailed tab permissions
        $tabPermissions = $this->getUserTabPermissions($user->user_role_id);

        $user['profile_id'] = $profile_id;
        $user['firstname'] = $firstname;
        $user['lastname'] = $lastname;
        $user['profile_picture'] = $profile_picture;
        $user['accessible_modules'] = $accessibleModules;
        $user['tab_permissions'] = $tabPermissions;

        return $user;
    }

    /**
     * Get modules that the user's role has access to
     */
    private function getUserAccessibleModules($userRoleId)
    {
        // Get all modules with their module buttons and permissions
        $allModules = \App\Models\Module::with([
            'module_buttons.user_role_permissions' => function ($query) use ($userRoleId) {
                $query->where('user_role_id', $userRoleId);
            }
        ])->get(['id', 'module_code', 'module_name']);

        $accessibleModules = [];

        foreach ($allModules as $module) {
            $hasAccess = false;

            // Check if user has any active permission for this module
            foreach ($module->module_buttons as $button) {
                if ($button->user_role_permissions->isNotEmpty()) {
                    $permission = $button->user_role_permissions->first();
                    if ((int)$permission->status === 1) {
                        $hasAccess = true;
                        break;
                    }
                }
            }

            if ($hasAccess) {
                $accessibleModules[] = [
                    'id' => $module->id,
                    'module_code' => $module->module_code,
                    'module_name' => $module->module_name
                ];
            }
        }

        return collect($accessibleModules);
    }

    /**
     * Get detailed tab permissions for the user's role
     */
    private function getUserTabPermissions($userRoleId)
    {
        // Get all modules with their buttons and permissions for this role
        $modules = \App\Models\Module::with([
            'module_buttons' => function ($query) use ($userRoleId) {
                $query->with([
                    'user_role_permissions' => function ($query) use ($userRoleId) {
                        $query->where('user_role_id', $userRoleId);
                    }
                ]);
            }
        ])->get();

        $tabPermissions = [];

        foreach ($modules as $module) {
            $modulePermissions = [];
            
            foreach ($module->module_buttons as $button) {
                $hasPermission = false;
                
                if ($button->user_role_permissions->isNotEmpty()) {
                    $permission = $button->user_role_permissions->first();
                    $hasPermission = (int)$permission->status === 1;
                }
                
                $modulePermissions[$button->mod_button_code] = $hasPermission;
            }
            
            $tabPermissions[$module->module_name] = $modulePermissions;
        }

        return $tabPermissions;
    }

    public function initial_registration(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not created",
        ];

        DB::transaction(function () use ($request, &$ret) {
            $request->validate([
                'email' => [
                    'required',
                    Rule::unique('users')->ignore($request->id),
                ],
                'username' => [
                    'required',
                    Rule::unique('users')->ignore($request->id),
                ],
                'password' => 'required',
            ]);

            // Create & Update User
            $createdUser = [
                "user_role_id" => 4,
                'username' => $request->username,
                'email' => $request->email,
                "password" => Hash::make($request->password),
                // "created_by" => auth()->user()->id,
                "status" => 'Deactivated',
            ];

            $users = User::where('email', $request->email)->first();
            if ($users) {
                $updateusers = $users->fill($createdUser);
                $updateusers->save();
            } else {
                $users = \App\Models\User::create($createdUser);
            }

            $ret = [
                "success" => true,
                "message" => "Data " . ($request->id ? "updated" : "saved") . " successfully"
            ];
        });

        return response()->json($ret);
    }


    public function register(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data not created",
        ];

        DB::transaction(function () use ($request, &$ret) {
            $request->validate([
                'lastname' => [
                    'required',
                    Rule::unique('profiles')->where(function ($query) use ($request) {
                        return $query->where('firstname', $request->firstname);
                    }),
                ],
                'firstname' => 'required',
                'middlename' => 'sometimes|required',

                'birthplace' => 'required',
                'birthdate' => 'required',
                'age' => 'required',

                'contact_number' => 'required',
                'email' => 'required',

                'address_list' => 'required',

                'have_disability' => 'required',
                'have_difficulty' => 'required',

                'student_level_id' => 'required',
                'student_strand' => 'sometimes|required',
                'current_course_id' => 'sometimes|required',

                'exam_schedule_id' => 'required',
                'exam_category_id' => 'required',
                'student_status' => 'required',

                'first_course_id' => 'sometimes|required',
                'second_course_id' => 'sometimes|required',
                'third_course_id' => 'sometimes|required',

                'previous_school_name' => 'sometimes|required',
                'previous_school_year' => 'sometimes|required',
            ]);

            // Create & Update User
            $findUserId = \App\Models\User::where('email', $request->email)->first();

            if ($findUserId) {
                $dataProfile = [
                    "user_id" => $findUserId->id,
                    "school_id" => $request->school_id,

                    "firstname" => $request->firstname,
                    "middlename" => $request->middlename,
                    "lastname" => $request->lastname,
                    "name_ext" => $request->name_ext,
                    "birthdate" => $request->birthdate,
                    "age" => $request->age,
                    "birthplace" => $request->birthplace,
                    "gender" => $request->gender ?? null,

                    "religion_id" => $request->religion_id,
                    "civil_status_id" => $request->civil_status_id,
                    "nationality_id" => $request->nationality_id,
                    "blood_type" => $request->blood_type ?? null,
                    "height" => $request->height ?? null,
                    "weight" => $request->weight ?? null,
                ];

                $findProfilByUserId = \App\Models\Profile::where('user_id', $findUserId->id)->first();

                $contact_number = $request->contact_number;
                $address_list = $request->address_list;

                if ($findProfilByUserId) {

                    // Language Update and Create
                    $languages = is_array($request->language) ? $request->language : [$request->language];

                    $existingLanguages = \App\Models\ProfileLanguage::where('profile_id', $findProfilByUserId->id)->pluck('language')->toArray();

                    foreach ($existingLanguages as $current) {
                        if (!in_array($current, $languages)) {
                            // Deactive existing language if not in new languages
                            \App\Models\ProfileLanguage::where('profile_id', $$findProfilByUserId->id)
                                ->where('language', $current)
                                ->update(['status' => 0]);
                        }
                    }

                    // Add new languages
                    foreach ($languages as $language) {
                        // Check if language is not empty or null
                        if (!empty($language)) {
                            $findLanguage = \App\Models\ProfileLanguage::where('profile_id', $$findProfilByUserId->id)
                                ->where('language', $language)
                                ->first();

                            if ($findLanguage) {
                                $findLanguage->fill([
                                    "profile_id" => $profile_id,
                                    'language' => $language,
                                    'status' => 1,
                                    'updated_by' => auth()->user()->id
                                ])->save();
                            } else {
                                \App\Models\ProfileLanguage::create([
                                    "profile_id" => $profile_id,
                                    'language' => $language,
                                    'status' => 1,
                                    'created_by' => auth()->user()->id
                                ]);
                            }
                        }
                    }

                    // Contact Information Update and Create
                    if ($contact_number != "") {

                        \App\Models\ProfileContactInformation::where("profile_id", $profile_id)->update(['status' => 0]);

                        $findContactInformation = \App\Models\ProfileContactInformation::where("contact_number", $contact_number)
                            ->where("profile_id", $profile_id)
                            ->first();

                        if ($findContactInformation) {
                            $findContactInformation->fill([
                                "status" => 1,
                                "email" => $request->personal_email,
                                "updated_by" => auth()->user()->id,
                            ])->save();
                        } else {
                            \App\Models\ProfileContactInformation::create([
                                'contact_number' => $contact_number,
                                'category' => 'Student Contact Information',
                                "fullname" => $request->firstname . ' ' . (!empty($request->middlename) ? $request->middlename . ' ' : '') .
                                    $request->lastname,
                                "email" => $request->personal_email,
                                "profile_id" => $profile_id,
                                "created_by" => auth()->user()->id,
                                'status' => 1,
                            ]);
                        }
                    }

                    // Student Address Update and Create
                    if (!empty($address_list)) {
                        foreach ($address_list as $key => $value) {
                            if (!empty($value['id'])) {
                                $findStudentAddress = \App\Models\ProfileAddress::where('id', $value['id'])
                                    ->where('category', 'STUDENT ADDRESS')
                                    ->first();

                                if ($findStudentAddress) {
                                    $findStudentAddress->fill([
                                        "profile_id" => $profile_id,
                                        'category' => "STUDENT ADDRESS",
                                        'address' => $value['address'] ?? null,
                                        'city_id' => $value['municipality_id'] ?? null,
                                        'barangay_id' => $value['barangay_id'] ?? null,
                                        'is_home_address' => !empty($value['is_home_address']) && $value['is_home_address'] ? 1 : 0,
                                        'is_current_address' => !empty($value['is_current_address']) && $value['is_current_address'] ? 1 : 0,
                                        'updated_by' => auth()->user()->id
                                    ])->save();
                                }
                            } else {
                                \App\Models\ProfileAddress::create([
                                    "profile_id" => $profile_id,
                                    'category' => "STUDENT ADDRESS",
                                    'address' => $value['address'] ?? null,
                                    'city_id' => $value['municipality_id'] ?? null,
                                    'barangay_id' => $value['barangay_id'] ?? null,
                                    'is_home_address' => !empty($value['is_home_address']) && $value['is_home_address'] ? 1 : 0,
                                    'is_current_address' => !empty($value['is_current_address']) && $value['is_current_address'] ? 1 : 0,
                                    'created_by' => auth()->user()->id
                                ]);
                            }
                        }
                    }

                    // Profile Health Information
                    $findHealthInfo = \App\Models\ProfileHealthInformations::where('profile_id', $profile_id)
                        ->first();

                    if ($findHealthInfo) {
                        $findHealthInfo->fill([
                            "profile_id" => $profile_id,

                            'have_disability' => $request->have_disability ?? null,
                            'disability_type' => is_array($request->disability_type) ? implode(', ', $request->disability_type) :
                                $request->disability_type,
                            'other_disability' => $request->other_disability ?? null,

                            'have_difficulty' => $request->have_difficulty ?? null,
                            'difficulty_type' => is_array($request->difficulty_type) ? implode(', ', $request->difficulty_type) :
                                $request->difficulty_type,
                            'other_difficulty' => $request->other_difficulty ?? null,


                            'updated_by' => auth()->user()->id
                        ])->save();
                    } else {
                        \App\Models\ProfileHealthInformations::create([
                            "profile_id" => $profile_id,

                            'have_disability' => $request->have_disability ?? null,
                            'disability_type' => is_array($request->disability_type) ? implode(', ', $request->disability_type) :
                                $request->disability_type,

                            'other_disability' => $request->other_disability ?? null,

                            'have_difficulty' => $request->have_difficulty ?? null,
                            'difficulty_type' => is_array($request->difficulty_type) ? implode(', ', $request->difficulty_type) :
                                $request->difficulty_type,
                            'other_difficulty' => $request->other_difficulty ?? null,

                            'created_by' => auth()->user()->id
                        ]);
                    }

                    // Student Exam Result Update and Create
                    $findStudentExam = \App\Models\StudentExam::where("profile_id", $profile_id)
                        ->first();

                    // $examCategory = RefExamCategory::where('id', $request->exam_category_id)->first();

                    if ($findStudentExam) {

                        $findStudentExam->fill([
                            "profile_id" => $profile_id,
                            'exam_schedule_id' => $request->exam_schedule_id,
                            "exam_category_id" => $request->exam_category_id,
                            'scholarship' => is_array($request->scholarship) ? implode(' , ', $request->scholarship) : $request->scholarship,
                            "schedule_status" => $request->schedule_status,
                            "updated_by" => auth()->user()->id,
                        ])->save();
                    } else {
                        \App\Models\StudentExam::create([
                            "profile_id" => $profile_id,
                            'exam_schedule_id' => $request->exam_schedule_id,
                            "exam_category_id" => $request->exam_category_id,
                            'scholarship' => is_array($request->scholarship) ? implode(' , ', $request->scholarship) : $request->scholarship,
                            "schedule_status" => 'Applied',
                            "category" => 'Walk-In',
                            "status" => 'Active',
                            "created_by" => auth()->user()->id,
                        ]);
                    }

                    // Academic Profile Update & Create
                    $findStudentAcademic = \App\Models\StudentAcademic::where('profile_id', $profile_id)
                        ->where('category', 'Academic Profile')
                        ->first();

                    if ($findStudentAcademic) {
                        $findStudentAcademic->fill([
                            "profile_id" => $profile_id,
                            'student_status' => $request->student_status ?? null,
                            'student_level_id' => $request->student_level_id ?? null,
                            // 'student_strand' => $request->student_level_id == 4 ? $request->student_strand : null,
                            'student_strand' => $request->student_strand,
                            'current_course_id' => $request->current_course_id,

                            // Top three courses
                            'first_course_id' => $request->first_course_id,
                            'second_course_id' => $request->second_course_id,
                            'third_course_id' => $request->third_course_id ?? null,

                            // Transferee
                            'previous_school_name' => $request->student_status == "Transferee" ? $request->previous_school_name : null,
                            'previous_school_year' => $request->student_status == "Transferee" ? $request->previous_school_year : null,
                            'applied_to_fsuu' => $request->student_status == "Transferee" ? $request->applied_to_fsuu : null,
                            'year_applied' => $request->student_status == "Transferee" && $request->applied_to_fsuu == "No" ? null :
                                $request->year_applied,
                            'accepted_to_fsuu' => $request->student_status == "Transferee" ? $request->accepted_to_fsuu : null,
                            'year_accepted' => $request->student_status == "Transferee" && $request->accepted_to_fsuu == "No" ? null :
                                $request->year_accepted,
                            'attended_to_fsuu' => $request->student_status == "Transferee" ? $request->attended_to_fsuu : null,
                            'year_attended' => $request->student_status == "Transferee" && $request->attended_to_fsuu == "No" ? null :
                                $request->year_attended,

                            // Pursuing a Second Degree
                            'intend_to_pursue' => $request->student_status == "Pursuing a Second Degree" ? $request->intend_to_pursue : null,
                            'working_student' => $request->student_status == "Pursuing a Second Degree" ? $request->working_student : null,
                            'employer_name' => $request->student_status == "Pursuing a Second Degree" ? $request->employer_name : null,
                            'employer_address' => $request->student_status == "Pursuing a Second Degree" ? $request->employer_address : null,

                            'updated_by' => auth()->user()->id
                        ])->save();
                    } else {
                        \App\Models\StudentAcademic::create([
                            "profile_id" => $profile_id,
                            'category' => 'Academic Profile',
                            'student_status' => $request->student_status ?? null,
                            'student_level_id' => $request->student_level_id ?? null,
                            'student_strand' => $request->student_strand ?? null,
                            'current_course_id' => $request->current_course_id ?? null,

                            // Top three courses
                            'first_course_id' => $request->first_course_id ?? null,
                            'second_course_id' => $request->second_course_id ?? null,
                            'third_course_id' => $request->third_course_id ?? null,

                            // Transferee
                            'previous_school_name' => $request->previous_school_name ?? null,
                            'previous_school_year' => $request->previous_school_year ?? null,
                            'applied_to_fsuu' => $request->applied_to_fsuu ?? null,
                            'year_applied' => $request->year_applied ?? null,
                            'accepted_to_fsuu' => $request->accepted_to_fsuu ?? null,
                            'year_accepted' => $request->year_accepted ?? null,
                            'attended_to_fsuu' => $request->attended_to_fsuu ?? null,
                            'year_attended' => $request->year_attended ?? null,

                            // Pursuing a Second Degree
                            'intend_to_pursue' => $request->intend_to_pursue ?? null,
                            'working_student' => $request->working_student ?? null,
                            'employer_name' => $request->employer_name ?? null,
                            'employer_address' => $request->employer_address ?? null,

                            'created_by' => auth()->user()->id
                        ]);
                    }

                    $this->user_persmissions($findUserId->id, $request->user_role_id);
                }

                $from_name = \App\Models\Profile::where('user_id', auth()->user()->id)->latest()->first();

                // Email ACCOUNT REGISTRATION
                $this->send_email([
                    'title' => "ACCOUNT REGISTRATION",
                    'to_name' => $request->firstname . " " . $request->lastname,
                    'account' => $request->username,
                    'password' => $request->password,
                    'exam_schedule ' => $request->exam_schedule_id,
                    'position' => "FSUU GUIDANCE",
                    'to_email' => $request->personal_email,
                    'sender_name' => auth()->user()->firstname . " " . auth()->user()->lastname,
                    "system_id" => 3,
                ]);

                $this->send_notification([
                    "title" => "New Student Application",
                    "description" => "Your application was approved",
                    "link" => "",
                    "link_origin" => $request->link_origin,
                    "userIds" => [$findUserId->id],
                    "system_id" => 3,
                ]);

                $ret = [
                    "success" => true,
                    "message" => "Data " . ($request->id ? "updated" : "saved") . " successfully"
                ];
            }

            $ret = [
                "success" => true,
                "message" => "Data " . ($request->id ? "updated" : "saved") . " successfully"
            ];
        });

        return response()->json($ret);
    }

    public function check_auth_status()
    {
        $ret = [
            "success" => true,
            "message" => "Authentication status ok",
        ];

        return response()->json($ret, 200);
    }

    /**
     * Get updated user data with current permissions
     */
    public function refresh_user_data()
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // Get updated user data with latest permissions
        $userData = $this->login_data(request(), $user);

        return response()->json([
            'success' => true,
            'data' => $userData,
            'message' => 'User data refreshed successfully'
        ], 200);
    }

    /**
     * Verify the current user's password
     * Used for sensitive operations that require password re-verification
     */
    public function verifyPassword(Request $request)
    {
        try {
            $request->validate([
                'password' => 'required|string'
            ]);

            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Check if the provided password matches the user's password
            if (Hash::check($request->password, $user->password)) {
                // Log successful verification
                \Log::info('Password verification successful', [
                    'user_id' => $user->id,
                    'username' => $user->username,
                    'action' => 'password_verification',
                    'verified_at' => now()->toISOString()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Password verified successfully',
                    'data' => [
                        'verified' => true,
                        'user_id' => $user->id,
                        'username' => $user->username,
                        'verified_at' => now()->toISOString()
                    ]
                ], 200);
            } else {
                // Log failed verification attempt
                \Log::warning('Password verification failed', [
                    'user_id' => $user->id,
                    'username' => $user->username,
                    'action' => 'password_verification_failed',
                    'attempted_at' => now()->toISOString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid password. Please try again.'
                ], 401);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Password verification error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during password verification'
            ], 500);
        }
    }

    /**
     * Logout user and revoke token
     */
    public function logout(Request $request)
    {
        try {
            $user = auth()->user();
            
            if ($user) {
                // Revoke the current access token
                $token = $user->token();
                if ($token) {
                    $token->revoke();
                }
                
                // Log the logout
                LoginLogController::logAttempt($user->email, 'LOGOUT', $user->id, 'User logout');
                
                return response()->json([
                    'success' => true,
                    'message' => 'Successfully logged out'
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'No authenticated user found'
            ], 401);
            
        } catch (\Exception $e) {
            \Log::error('Logout error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during logout'
            ], 500);
        }
    }
}
