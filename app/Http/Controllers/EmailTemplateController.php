<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use App\Traits\ChecksPermissions;
use Illuminate\Http\Request;

class EmailTemplateController extends Controller
{
    use ChecksPermissions;
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $data = EmailTemplate::with([
            'attachments' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'headerImages',
            'footerImages'
        ]);

        if ($request->has("system_id")) {
            $data->where("system_id", $request->system_id);
        }

        // Add search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $data->where(function ($query) use ($search) {
                $query->where('title', 'LIKE', "%{$search}%")
                      ->orWhere('subject', 'LIKE', "%{$search}%")
                      ->orWhere('body', 'LIKE', "%{$search}%")
                      ->orWhere('template_type', 'LIKE', "%{$search}%");
            });
        }

        // Add filter by template type
        if ($request->has('template_type') && !empty($request->template_type)) {
            $data->where('template_type', $request->template_type);
        }

        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $data = $data->orderBy(isset($request->sort_field) ? $request->sort_field : 'id', isset($request->sort_order)  ? $request->sort_order : 'desc');
            }
        } else {
            $data = $data->orderBy('id', 'desc');
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
            'data'      => $data,
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
        // Authorization check - edit or setup email template
        if ($response = $this->authorizeOrFail(['M-04-TEMPLATE-EDIT', 'M-04-TEMPLATE-SETUP'], "Unauthorized: You don't have permission to manage email templates.")) {
            return $response;
        }

        $ret = [
            "success" => false,
            "message" => "Email template not " . ($request->id ? "updated" : "created") . "."
        ];

        $data = $request->validate([
            "title" => "required",
            "subject" => "required",
            "body" => "required",
            "template_type" => "required|in:verification_result_success,verification_result_revoked",
            "is_active" => "boolean",
            "system_id" => "required",
            "header_images" => "nullable|array",
            "header_images.*" => "image|mimes:jpeg,png,jpg,gif,svg|max:2048",
            "footer_images" => "nullable|array", 
            "footer_images.*" => "image|mimes:jpeg,png,jpg,gif,svg|max:2048",
            "header_image_dimensions" => "nullable|array",
            "footer_image_dimensions" => "nullable|array",
            "existing_header_images" => "nullable|array",
            "existing_footer_images" => "nullable|array",
            "default_header_images" => "nullable|array",
            "default_footer_images" => "nullable|array"
        ]);

        // Check for duplicate template types (only when creating new or changing type)
        $isCreating = !$request->id;
        $isChangingType = false;
        
        if (!$isCreating) {
            $existingTemplate = EmailTemplate::find($request->id);
            $isChangingType = $existingTemplate && $existingTemplate->template_type !== $data['template_type'];
        }
        
        if ($isCreating || $isChangingType) {
            $existingTemplate = EmailTemplate::where('template_type', $data['template_type'])
                ->where('system_id', $data['system_id'])
                ->when($request->id, function($query) use ($request) {
                    return $query->where('id', '!=', $request->id);
                })
                ->first();
                
            if ($existingTemplate) {
                $templateTypes = EmailTemplate::getTemplateTypes();
                $typeName = $templateTypes[$data['template_type']] ?? $data['template_type'];
                
                return response()->json([
                    "success" => false,
                    "message" => "A template of type '{$typeName}' already exists. Only one template per type is allowed.",
                    "errors" => [
                        "template_type" => ["A template of type '{$typeName}' already exists."]
                    ]
                ], 422);
            }
        }

        // Remove image data from main data array
        $imageData = [
            'header_images' => $request->file('header_images') ?? [],
            'footer_images' => $request->file('footer_images') ?? [],
            'header_image_dimensions' => $request->input('header_image_dimensions', []),
            'footer_image_dimensions' => $request->input('footer_image_dimensions', []),
            'existing_header_images' => $request->input('existing_header_images', []),
            'existing_footer_images' => $request->input('existing_footer_images', []),
            'default_header_images' => $request->input('default_header_images', []),
            'default_footer_images' => $request->input('default_footer_images', [])
        ];
        
        // Remove image fields from main data
        unset($data['header_images'], $data['footer_images'], $data['header_image_dimensions'], $data['footer_image_dimensions'], $data['existing_header_images'], $data['existing_footer_images'], $data['default_header_images'], $data['default_footer_images']);

        $email_template = EmailTemplate::updateOrCreate(
            ["id" => $request->id],
            $data
        );

        if ($email_template) {
            // Handle header images (only allow 1)
            if (!empty($imageData['header_images'])) {
                // Remove existing header images only when new header images are uploaded
                if ($request->id) {
                    $existingHeaderImages = $email_template->headerImages;
                    foreach ($existingHeaderImages as $headerImage) {
                        // Delete the file
                        $filePath = str_replace('storage/', '', $headerImage->file_path);
                        $fullPath = storage_path('app/public/' . $filePath);
                        if (file_exists($fullPath)) {
                            unlink($fullPath);
                        }
                        // Delete the attachment record
                        $headerImage->delete();
                    }
                }
                
                // Take only the first image
                $image = $imageData['header_images'][0];
                $dimensions = $imageData['header_image_dimensions'][0] ?? null;
                $this->create_attachment($email_template, $image, [
                    "folder_name" => "email_templates/template-{$email_template->id}/header_images",
                    "file_description" => "Header Image",
                    "image_dimensions" => $dimensions
                ]);
            }

            // Handle footer images (only allow 1)
            if (!empty($imageData['footer_images'])) {
                // Remove existing footer images only when new footer images are uploaded
                if ($request->id) {
                    $existingFooterImages = $email_template->footerImages;
                    foreach ($existingFooterImages as $footerImage) {
                        // Delete the file
                        $filePath = str_replace('storage/', '', $footerImage->file_path);
                        $fullPath = storage_path('app/public/' . $filePath);
                        if (file_exists($fullPath)) {
                            unlink($fullPath);
                        }
                        // Delete the attachment record
                        $footerImage->delete();
                    }
                }
                
                // Take only the first image
                $image = $imageData['footer_images'][0];
                $dimensions = $imageData['footer_image_dimensions'][0] ?? null;
                $this->create_attachment($email_template, $image, [
                    "folder_name" => "email_templates/template-{$email_template->id}/footer_images", 
                    "file_description" => "Footer Image",
                    "image_dimensions" => $dimensions
                ]);
            }

            // Update dimensions for existing header images
            if (!empty($imageData['existing_header_images'])) {
                \Log::info('Updating existing header images dimensions:', $imageData['existing_header_images']);
                foreach ($imageData['existing_header_images'] as $imageId => $dimensions) {
                    $attachment = \App\Models\Attachment::find($imageId);
                    if ($attachment && $attachment->attachmentable_id == $email_template->id) {
                        \Log::info('Updating attachment ' . $imageId . ' with dimensions:', $dimensions);
                        $attachment->update([
                            'image_dimensions' => [
                                'width' => $dimensions['width'],
                                'height' => $dimensions['height']
                            ]
                        ]);
                    } else {
                        \Log::warning('Attachment not found or not owned by template: ' . $imageId);
                    }
                }
            }

            // Update dimensions for existing footer images
            if (!empty($imageData['existing_footer_images'])) {
                \Log::info('Updating existing footer images dimensions:', $imageData['existing_footer_images']);
                foreach ($imageData['existing_footer_images'] as $imageId => $dimensions) {
                    $attachment = \App\Models\Attachment::find($imageId);
                    if ($attachment && $attachment->attachmentable_id == $email_template->id) {
                        \Log::info('Updating attachment ' . $imageId . ' with dimensions:', $dimensions);
                        $attachment->update([
                            'image_dimensions' => [
                                'width' => $dimensions['width'],
                                'height' => $dimensions['height']
                            ]
                        ]);
                    } else {
                        \Log::warning('Attachment not found or not owned by template: ' . $imageId);
                    }
                }
            }

            // Handle default header images (copy from default banners)
            if (!empty($imageData['default_header_images'])) {
                // Remove existing header images first
                $existingHeaderImages = $email_template->headerImages;
                foreach ($existingHeaderImages as $headerImage) {
                    // Delete the file
                    $filePath = str_replace('storage/', '', $headerImage->file_path);
                    $fullPath = storage_path('app/public/' . $filePath);
                    if (file_exists($fullPath)) {
                        unlink($fullPath);
                    }
                    // Delete the attachment record
                    $headerImage->delete();
                }

                // Copy default banner images
                foreach ($imageData['default_header_images'] as $defaultImageData) {
                    $this->copyDefaultBannerImage($email_template, $defaultImageData, 'header');
                }
            }

            // Handle default footer images (copy from default banners)
            if (!empty($imageData['default_footer_images'])) {
                // Remove existing footer images first
                $existingFooterImages = $email_template->footerImages;
                foreach ($existingFooterImages as $footerImage) {
                    // Delete the file
                    $filePath = str_replace('storage/', '', $footerImage->file_path);
                    $fullPath = storage_path('app/public/' . $filePath);
                    if (file_exists($fullPath)) {
                        unlink($fullPath);
                    }
                    // Delete the attachment record
                    $footerImage->delete();
                }

                // Copy default banner images
                foreach ($imageData['default_footer_images'] as $defaultImageData) {
                    $this->copyDefaultBannerImage($email_template, $defaultImageData, 'footer');
                }
            }

            // Load the template with attachments for response
            $email_template->load(['attachments', 'headerImages', 'footerImages']);

            $ret = [
                "success" => true,
                "message" => "Email template " . ($request->id ? "updated" : "created") . " successfully.",
                "data" => $email_template
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\EmailTemplate  $emailTemplate
     * @return \Illuminate\Http\Response
     */
    public function show(EmailTemplate $emailTemplate)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\EmailTemplate  $emailTemplate
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, EmailTemplate $emailTemplate)
    {
        //
    }

    /**
     * Send test email using Gmail integration
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function sendTestEmail(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Test email could not be sent."
        ];

        try {
            $data = $request->validate([
                "title" => "required",
                "subject" => "required", 
                "body" => "required",
                "template_type" => "required|in:verification_result_success,verification_result_revoked",
                "template_id" => "nullable|integer" // Optional template ID for existing templates
            ]);

            // Initialize Gmail Service
            $gmailService = app(\App\Services\GmailService::class);
            
            if (!$gmailService->isReady()) {
                return response()->json([
                    "success" => false,
                    "message" => "Gmail service is not configured properly."
                ], 500);
            }

            // Get header and footer images if template ID is provided
            $headerImages = [];
            $footerImages = [];
            
            if (!empty($data['template_id'])) {
                $template = EmailTemplate::with(['headerImages', 'footerImages'])->find($data['template_id']);
                if ($template) {
                    $headerImages = $template->headerImages;
                    $footerImages = $template->footerImages;
                }
            }

            // Get random profile once for consistent data
            $randomProfile = $this->getRandomProfileForTesting();
            
            // Create test email data
            $testEmailData = [
                'to' => 'castrodesjohnpaul@gmail.com',
                'subject' => '[TEST] ' . $data['subject'] . ' - ' . $randomProfile['name'],
                'body' => $this->buildTestEmailBody($data, $headerImages, $footerImages, $randomProfile),
                'attachments' => [] // No attachments for test emails
            ];

            // Send via Gmail
            $result = $gmailService->sendEmail($testEmailData);
            
            $ret = [
                "success" => true,
                "message" => "Test email sent successfully to castrodesjohnpaul@gmail.com using real data from: " . $randomProfile['name'],
                "data" => [
                    "gmail_id" => $result['id'],
                    "thread_id" => $result['threadId'],
                    "test_profile" => $randomProfile['name']
                ]
            ];

        } catch (\Illuminate\Validation\ValidationException $e) {
            $ret = [
                "success" => false,
                "message" => "Validation failed.",
                "errors" => $e->errors()
            ];
        } catch (\Exception $e) {
            \Log::error('Test email send error: ' . $e->getMessage());
            $ret = [
                "success" => false,
                "message" => "Failed to send test email: " . $e->getMessage()
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Build test email body with template preview including header and footer images
     */
    private function buildTestEmailBody($data, $headerImages = [], $footerImages = [], $randomProfile = null)
    {
        // Use provided profile or get a random one
        if (!$randomProfile) {
            $randomProfile = $this->getRandomProfileForTesting();
        }
        
        $testVariables = [
            'user:name' => $randomProfile['name'],
            'user:account' => $randomProfile['email'],
            'user:password' => '********',
            'document:type' => 'Transcript of Records',
            'verification:status' => 'Verified',
            'verification:date' => date('Y-m-d H:i A'),
            'auth:code' => '123456',
            'message:reference' => 'TEST-' . date('YmdHis'),
            'message:date' => date('Y-m-d H:i A'),
            'profile:grades' => $randomProfile['grades_html']
        ];

        $body = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: transparent;">';
        
        // Header Images Section
        if (!empty($headerImages)) {
            $body .= '<div style="text-align: center; margin-bottom: 20px;">';
            foreach ($headerImages as $image) {
                $base64Image = $this->getImageAsBase64($image->file_path);
                if ($base64Image) {
                    $dimensions = $image->image_dimensions;
                    $width = isset($dimensions['width']) ? $dimensions['width'] . 'px' : '100%';
                    $height = isset($dimensions['height']) ? $dimensions['height'] . 'px' : 'auto';
                    
                    $body .= '<img src="' . $base64Image . '" alt="Header Banner" style="';
                    $body .= 'width: ' . $width . '; ';
                    $body .= 'height: ' . $height . '; ';
                    $body .= 'object-fit: contain; ';
                    $body .= 'background-color: transparent; ';
                    $body .= 'display: inline-block; ';
                    $body .= 'margin-bottom: 8px;';
                    $body .= '" />';
                }
            }
            $body .= '</div>';
        }
        
        // Main Body Content (no container styling - clean email look)
        // Replace variables in the body content
        $processedBody = $data['body'];
        foreach ($testVariables as $variable => $value) {
            $processedBody = str_replace('[' . $variable . ']', $value, $processedBody);
        }

        $body .= $processedBody;

        // Footer Images Section
        if (!empty($footerImages)) {
            $body .= '<div style="text-align: center; margin-top: 20px;">';
            foreach ($footerImages as $image) {
                $base64Image = $this->getImageAsBase64($image->file_path);
                if ($base64Image) {
                    $dimensions = $image->image_dimensions;
                    $width = isset($dimensions['width']) ? $dimensions['width'] . 'px' : '100%';
                    $height = isset($dimensions['height']) ? $dimensions['height'] . 'px' : 'auto';
                    
                    $body .= '<img src="' . $base64Image . '" alt="Footer Banner" style="';
                    $body .= 'width: ' . $width . '; ';
                    $body .= 'height: ' . $height . '; ';
                    $body .= 'object-fit: contain; ';
                    $body .= 'background-color: transparent; ';
                    $body .= 'display: inline-block; ';
                    $body .= 'margin-bottom: 8px;';
                    $body .= '" />';
                }
            }
            $body .= '</div>';
        }
        
        $body .= '</div>';

        return $body;
    }

    /**
     * Convert image file to base64 data URL for embedding in emails
     */
    private function getImageAsBase64($filePath)
    {
        try {
            // Remove 'storage/' prefix if present and get the actual file path
            $actualPath = str_replace('storage/', '', $filePath);
            $fullPath = storage_path('app/public/' . $actualPath);
            
            // Check if file exists
            if (!file_exists($fullPath)) {
                \Log::warning('Image file not found for email: ' . $fullPath);
                return null;
            }
            
            // Get file contents and MIME type
            $imageData = file_get_contents($fullPath);
            $mimeType = mime_content_type($fullPath);
            
            if (!$imageData) {
                \Log::warning('Could not read image file: ' . $fullPath);
                return null;
            }
            
            // Convert to base64 and create data URL
            $base64 = base64_encode($imageData);
            return 'data:' . $mimeType . ';base64,' . $base64;
            
        } catch (\Exception $e) {
            \Log::error('Error converting image to base64: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get a random profile from the system for realistic test email data
     */
    private function getRandomProfileForTesting()
    {
        try {
            // Get a random profile with grades and user data
            $profile = \App\Models\Profile::with(['grades.subject', 'user'])
                ->whereHas('grades') // Only profiles that have grades
                ->whereHas('user') // Only profiles that have associated users
                ->inRandomOrder()
                ->first();
            
            if (!$profile) {
                // Fallback to sample data if no profiles with grades exist
                return [
                    'name' => 'John Doe (Sample User)',
                    'email' => 'sample.user@fsuu.edu.ph',
                    'grades_html' => $this->generateSampleGradesTable()
                ];
            }
            
            // Build full name
            $fullName = trim($profile->firstname . ' ' . $profile->lastname);
            if ($profile->middlename) {
                $fullName = trim($profile->firstname . ' ' . $profile->middlename . ' ' . $profile->lastname);
            }
            if ($profile->name_ext) {
                $fullName .= ' ' . $profile->name_ext;
            }
            
            // Get user email or generate a test email
            $email = $profile->user->email ?? ($profile->user->username ?? 'test.user') . '@fsuu.edu.ph';
            
            // Generate grades HTML for this profile
            $gradesHtml = $this->generateProfileGradesTable($profile->id);
            
            return [
                'name' => $fullName . ' (Test Data)',
                'email' => $email,
                'grades_html' => $gradesHtml,
                'profile_id' => $profile->id
            ];
            
        } catch (\Exception $e) {
            \Log::warning('Could not get random profile for testing: ' . $e->getMessage());
            
            // Fallback to sample data
            return [
                'name' => 'John Doe (Sample User)',
                'email' => 'sample.user@fsuu.edu.ph',
                'grades_html' => $this->generateSampleGradesTable()
            ];
        }
    }

    /**
     * Generate sample grades table for test emails
     */
    private function generateSampleGradesTable()
    {
        $html = '<div style="margin: 20px 0;">';
        
        // Sample data organized by year and semester
        $sampleGrades = [
            '1st Year' => [
                '1st Semester' => [
                    ['subject_code' => 'IT 170', 'grade' => '1.5'],
                    ['subject_code' => 'IT 171', 'grade' => '1.8'],
                    ['subject_code' => 'MATH 171', 'grade' => '2.0'],
                    ['subject_code' => 'ENG 101', 'grade' => '1.7'],
                ],
                '2nd Semester' => [
                    ['subject_code' => 'IT 172', 'grade' => '1.6'],
                    ['subject_code' => 'IT 173', 'grade' => '1.9'],
                    ['subject_code' => 'MATH 172', 'grade' => '2.1'],
                    ['subject_code' => 'FIL 101', 'grade' => '1.8'],
                ]
            ],
            '2nd Year' => [
                '1st Semester' => [
                    ['subject_code' => 'IT 270', 'grade' => '1.4'],
                    ['subject_code' => 'IT 271', 'grade' => '1.7'],
                    ['subject_code' => 'MATH 270', 'grade' => '1.9'],
                ],
                '2nd Semester' => [
                    ['subject_code' => 'IT 272', 'grade' => '1.5'],
                    ['subject_code' => 'IT 273', 'grade' => '1.8'],
                ]
            ]
        ];
        
        foreach ($sampleGrades as $yearLevel => $semesters) {
            foreach ($semesters as $semester => $grades) {
                $html .= '<div style="margin-bottom: 20px;">';
                $html .= '<h4 style="margin: 10px 0; color: #333; font-size: 14px; font-weight: bold;">' . $yearLevel . ' - ' . $semester . '</h4>';
                $html .= '<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px;">';
                $html .= '<thead>';
                $html .= '<tr style="background-color: #f5f5f5;">';
                $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Subject Code</th>';
                $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Grade</th>';
                $html .= '</tr>';
                $html .= '</thead>';
                $html .= '<tbody>';
                
                foreach ($grades as $grade) {
                    $html .= '<tr>';
                    $html .= '<td style="border: 1px solid #ddd; padding: 8px;">' . htmlspecialchars($grade['subject_code']) . '</td>';
                    $html .= '<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">' . htmlspecialchars($grade['grade']) . '</td>';
                    $html .= '</tr>';
                }
                
                $html .= '</tbody>';
                $html .= '</table>';
                $html .= '</div>';
            }
        }
        
        $html .= '</div>';
        return $html;
    }

    /**
     * Generate actual grades table for a specific profile
     */
    public function generateProfileGradesTable($profileId)
    {
        try {
            // Load profile with grades and related data
            $profile = \App\Models\Profile::with(['grades.subject'])
                ->find($profileId);
                
            if (!$profile || !$profile->grades || $profile->grades->isEmpty()) {
                return '<p style="color: #666; font-style: italic;">No grades available for this student.</p>';
            }
            
            $html = '<div style="margin: 20px 0;">';
            
            // Group grades by year level and semester
            $groupedGrades = [];
            foreach ($profile->grades as $grade) {
                if ($grade->subject) {
                    $yearLevel = $grade->subject->year_level;
                    $semester = $grade->subject->semester;
                    
                    // Convert semester to readable format
                    $semesterLabel = $semester == '1' ? '1st Semester' : 
                                   ($semester == '2' ? '2nd Semester' : 
                                   ($semester == 'summer' ? 'Summer' : $semester));
                    
                    $yearLabel = $yearLevel . 'st Year';
                    if ($yearLevel == 2) $yearLabel = '2nd Year';
                    elseif ($yearLevel == 3) $yearLabel = '3rd Year';
                    elseif ($yearLevel == 4) $yearLabel = '4th Year';
                    
                    if (!isset($groupedGrades[$yearLabel])) {
                        $groupedGrades[$yearLabel] = [];
                    }
                    if (!isset($groupedGrades[$yearLabel][$semesterLabel])) {
                        $groupedGrades[$yearLabel][$semesterLabel] = [];
                    }
                    
                    $groupedGrades[$yearLabel][$semesterLabel][] = [
                        'subject_code' => $grade->subject->subject_code,
                        'grade' => number_format($grade->grade, 1)
                    ];
                }
            }
            
            // Generate HTML tables for each year/semester combination
            foreach ($groupedGrades as $yearLevel => $semesters) {
                foreach ($semesters as $semester => $grades) {
                    $html .= '<div style="margin-bottom: 20px;">';
                    $html .= '<h4 style="margin: 10px 0; color: #333; font-size: 14px; font-weight: bold;">' . $yearLevel . ' - ' . $semester . '</h4>';
                    $html .= '<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px;">';
                    $html .= '<thead>';
                    $html .= '<tr style="background-color: #f5f5f5;">';
                    $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Subject Code</th>';
                    $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Grade</th>';
                    $html .= '</tr>';
                    $html .= '</thead>';
                    $html .= '<tbody>';
                    
                    foreach ($grades as $grade) {
                        $html .= '<tr>';
                        $html .= '<td style="border: 1px solid #ddd; padding: 8px;">' . htmlspecialchars($grade['subject_code']) . '</td>';
                        $html .= '<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">' . htmlspecialchars($grade['grade']) . '</td>';
                        $html .= '</tr>';
                    }
                    
                    $html .= '</tbody>';
                    $html .= '</table>';
                    $html .= '</div>';
                }
            }
            
            $html .= '</div>';
            return $html;
            
        } catch (\Exception $e) {
            \Log::error('Error generating profile grades table: ' . $e->getMessage());
            return '<p style="color: #ff0000;">Error loading grades data.</p>';
        }
    }

    /**
     * Get available template types
     *
     * @return \Illuminate\Http\Response
     */
    public function getTemplateTypes()
    {
        $templateTypes = EmailTemplate::getTemplateTypes();
        
        return response()->json([
            'success' => true,
            'data' => $templateTypes
        ], 200);
    }

    /**
     * Copy default banner image to email template
     */
    private function copyDefaultBannerImage($emailTemplate, $defaultImageData, $type)
    {
        try {
            // Find the default banner attachment
            $defaultAttachment = \App\Models\Attachment::find($defaultImageData['id']);
            if (!$defaultAttachment) {
                \Log::warning('Default banner attachment not found: ' . $defaultImageData['id']);
                return false;
            }

            // Get the original file path
            $originalFilePath = str_replace('storage/', '', $defaultAttachment->file_path);
            $originalFullPath = storage_path('app/public/' . $originalFilePath);
            
            if (!file_exists($originalFullPath)) {
                \Log::warning('Default banner file not found: ' . $originalFullPath);
                return false;
            }

            // Create new file path for the email template
            $folderName = "email_templates/template-{$emailTemplate->id}/{$type}_images";
            $fileName = time() . '_' . $defaultAttachment->file_name;
            $newFilePath = $folderName . '/' . $fileName;
            $newFullPath = storage_path('app/public/' . $newFilePath);

            // Ensure directory exists
            $directory = dirname($newFullPath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }

            // Copy the file
            if (!copy($originalFullPath, $newFullPath)) {
                \Log::error('Failed to copy default banner file from ' . $originalFullPath . ' to ' . $newFullPath);
                return false;
            }

            // Create new attachment record
            $newAttachment = $emailTemplate->attachments()->create([
                'file_name' => $defaultAttachment->file_name,
                'file_description' => $type === 'header' ? 'Header Image' : 'Footer Image',
                'file_path' => 'storage/' . $newFilePath,
                'file_size' => $defaultAttachment->file_size,
                'file_ext' => $defaultAttachment->file_ext,
                'file_type' => 'image',
                'file_type_origin' => $defaultAttachment->file_type_origin,
                'image_dimensions' => $defaultImageData['dimensions'] ?? $defaultAttachment->image_dimensions,
                'created_by' => auth()->user()->id ?? 1
            ]);

            \Log::info('Successfully copied default banner image for template ' . $emailTemplate->id);
            return $newAttachment;

        } catch (\Exception $e) {
            \Log::error('Error copying default banner image: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\EmailTemplate  $emailTemplate
     * @return \Illuminate\Http\Response
     */
    public function destroy(EmailTemplate $emailTemplate)
    {
        //
    }
}
