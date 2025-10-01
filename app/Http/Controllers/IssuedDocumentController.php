<?php

namespace App\Http\Controllers;

use App\Models\IssuedDocument;
use App\Models\Profile;
use App\Services\DigitalSignatureService;
use App\Traits\ChecksPermissions;
use Illuminate\Http\Request;

class IssuedDocumentController extends Controller
{
    use ChecksPermissions;
    
    protected $digitalSignatureService;

    public function __construct(DigitalSignatureService $digitalSignatureService)
    {
        $this->digitalSignatureService = $digitalSignatureService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Debug: Log all request parameters
        \Log::info('IssuedDocument API Request', [
            'all_params' => $request->all(),
            'search' => $request->search,
            'document_type' => $request->document_type,
            'revoked' => $request->revoked,
            'url' => $request->fullUrl()
        ]);

        $data = IssuedDocument::select([
            '*'
        ])->with(['profile', 'signature']);

        // Search functionality
        if ($request->search) {
            $data->where(function ($query) use ($request) {
                $searchTerm = "%{$request->search}%";
                
                // Search in document fields
                $query->where("document_type", 'LIKE', $searchTerm)
                    ->orWhere("serial_number", 'LIKE', $searchTerm)
                    ->orWhere("document_id_number", 'LIKE', $searchTerm)
                    ->orWhere("current_version", 'LIKE', $searchTerm)
                    ->orWhere("date_issued", 'LIKE', $searchTerm)
                    // Search in profile fields
                    ->orWhereHas('profile', function($q) use ($searchTerm) {
                        $q->where('firstname', 'LIKE', $searchTerm)
                          ->orWhere('lastname', 'LIKE', $searchTerm)
                          ->orWhere('middlename', 'LIKE', $searchTerm)
                          ->orWhere('id_number', 'LIKE', $searchTerm)
                          ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", [$searchTerm])
                          ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname) LIKE ?", [$searchTerm]);
                    })
                    // Search in user fields (email)
                    ->orWhereHas('profile.user', function($q) use ($searchTerm) {
                        $q->where('email', 'LIKE', $searchTerm);
                    });
                
                // Check if search term matches status
                if (strtolower($request->search) === 'issued' || strtolower($request->search) === 'active') {
                    $query->orWhere(function($q) {
                        $q->whereNull('date_revoked')
                          ->orWhere('date_revoked', '>', now());
                    });
                } elseif (strtolower($request->search) === 'revoked') {
                    $query->orWhereNotNull('date_revoked');
                }
            });
        }

        // Filter by document type if specified
        if ($request->document_type) {
            $data->where('document_type', $request->document_type);
        }

        // Filter by certification types (comma-separated list)
        if ($request->certification_types) {
            $certificationTypes = explode(',', $request->certification_types);
            $data->whereIn('document_type', $certificationTypes);
        }

        // Handle revoked/trashed documents filtering
        if ($request->isTrash || $request->revoked == 1) {
            // Show only revoked documents (soft deleted)
            $data->onlyTrashed();
        } else {
            // Show only active documents (not soft deleted)
            $data->whereNull('deleted_at');
        }

        // Additional filter for revoked documents based on date_revoked
        if ($request->revoked == 1) {
            $data->whereNotNull('date_revoked');
        } else if ($request->revoked == 0) {
            // For active documents, ensure they are not revoked
            $data->where(function($query) {
                $query->whereNull('date_revoked')
                      ->orWhere('date_revoked', '>', now());
            });
        }

        // Sorting functionality
        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null'  &&
                $request->sort_order != ''  && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                // Handle special case for profile sorting
                if ($request->sort_field === 'profile_fullname') {
                    // Join with profiles table for sorting by profile name
                    $data->leftJoin('profiles', 'issued_documents.profile_id', '=', 'profiles.id')
                         ->orderBy('profiles.fullname', $request->sort_order)
                         ->select('issued_documents.*'); // Ensure we only select issued_documents columns
                } else {
                    $data->orderBy($request->sort_field, $request->sort_order);
                }
            } else {
                $data->orderBy('issued_documents.id', 'asc');
            }
        } else {
            $data->orderBy('issued_documents.id', 'asc');
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
     * Generate serial number and document ID for Diploma
     */
    public function generateDiplomaSerial(Request $request)
    {
        try {
            // Validate request data
            $request->validate([
                'profile_id' => 'required|exists:profiles,id'
            ]);
            
            // Fetch profile
            $profile = Profile::findOrFail($request->profile_id);
            
            // Generate sequential serial numbers for Diploma
            $latestSerialEnd = IssuedDocument::withTrashed()
                ->where('document_type', 'Diploma')
                ->whereNotNull('serial_number')
                ->orderBy('created_at', 'desc')
                ->value('serial_number');
                
            $nextStart = 1;
            if ($latestSerialEnd) {
                if (preg_match('/(\d+)$/', $latestSerialEnd, $matches)) {
                    $nextStart = intval($matches[1]) + 1;
                }
            }
            
            $serialNumber = str_pad($nextStart, 6, '0', STR_PAD_LEFT);
            
            // Get the latest version for this profile (including soft-deleted documents)
            $latestDocument = IssuedDocument::withTrashed()
                ->where('profile_id', $request->profile_id)
                ->where('document_type', 'Diploma')
                ->orderBy('current_version', 'desc')
                ->first();
            
            $currentVersion = $latestDocument ? $latestDocument->current_version + 1.0 : 1.0;
            $documentId = 'DIP-' . str_pad($nextStart, 6, '0', STR_PAD_LEFT);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'serialNumber' => $serialNumber,
                    'documentId' => $documentId,
                    'currentVersion' => $currentVersion
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate diploma serial: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate serial number and document ID for Certificate of Units Earned
     */
    public function generateCertificateSerial(Request $request)
    {
        try {
            // Validate request data
            $request->validate([
                'profile_id' => 'required|exists:profiles,id'
            ]);
            
            // Fetch profile
            $profile = Profile::findOrFail($request->profile_id);
            
            // Generate sequential serial numbers for Certificate of Units Earned
            $latestSerialEnd = IssuedDocument::withTrashed()
                ->where('document_type', 'Certificate of Units Earned')
                ->whereNotNull('serial_number')
                ->orderBy('created_at', 'desc')
                ->value('serial_number');
                
            $nextStart = 1;
            if ($latestSerialEnd) {
                if (preg_match('/(\d+)$/', $latestSerialEnd, $matches)) {
                    $nextStart = intval($matches[1]) + 1;
                }
            }
            
            $serialNumber = str_pad($nextStart, 6, '0', STR_PAD_LEFT);
            
            // Get the latest version for this profile (including soft-deleted documents)
            $latestDocument = IssuedDocument::withTrashed()
                ->where('profile_id', $request->profile_id)
                ->where('document_type', 'Certificate of Units Earned')
                ->orderBy('current_version', 'desc')
                ->first();
            
            $currentVersion = $latestDocument ? $latestDocument->current_version + 1.0 : 1.0;
            $documentId = 'COUE-' . str_pad($nextStart, 6, '0', STR_PAD_LEFT);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'serialNumber' => $serialNumber,
                    'documentId' => $documentId,
                    'currentVersion' => $currentVersion
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate certificate serial: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate serial number and document ID for TOR
     */
    public function generateSerial(Request $request)
    {
        try {
            // Validate request data
            $request->validate([
                'profile_id' => 'required|exists:profiles,id'
            ]);
            
            // Fetch profile
            $profile = Profile::findOrFail($request->profile_id);
            
            // Calculate estimated pages (for serial range)
            $gradeCount = $profile->grades ? $profile->grades->count() : 0;
            $estimatedPages = max(2, ceil($gradeCount / 15)); // Minimum 2 pages, ~15 grades per page
            
            // Generate sequential serial numbers
            $latestSerialEnd = IssuedDocument::withTrashed()
                ->where('document_type', 'Transcript of Records')
                ->whereNotNull('serial_number')
                ->orderBy('created_at', 'desc')
                ->value('serial_number');
                
            $nextStart = 1;
            if ($latestSerialEnd) {
                if (preg_match('/(\d+)-(\d+)$/', $latestSerialEnd, $matches)) {
                    $nextStart = intval($matches[2]) + 1;
                } elseif (preg_match('/(\d+)$/', $latestSerialEnd, $matches)) {
                    $nextStart = intval($matches[1]) + 1;
                }
            }
            
            $serialStart = str_pad($nextStart, 6, '0', STR_PAD_LEFT);
            $serialEnd = str_pad($nextStart + $estimatedPages - 1, 6, '0', STR_PAD_LEFT);
            $serialNumber = $estimatedPages > 1 ? "{$serialStart}-{$serialEnd}" : $serialStart;
            
            // Get the latest version for this profile (including soft-deleted documents)
            $latestDocument = IssuedDocument::withTrashed()
                ->where('profile_id', $request->profile_id)
                ->where('document_type', 'Transcript of Records')
                ->orderBy('current_version', 'desc')
                ->first();
            
            $currentVersion = $latestDocument ? $latestDocument->current_version + 1.0 : 1.0;
            $documentId = 'TOR-' . str_pad($nextStart, 6, '0', STR_PAD_LEFT);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'serialNumber' => $serialNumber,
                    'documentId' => $documentId,
                    'estimatedPages' => $estimatedPages,
                    'currentVersion' => $currentVersion
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate serial: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save PDF file generated by frontend
     */
    public function savePDF(Request $request)
    {
        try {
            // Validate request data
            $request->validate([
                'pdf_file' => 'required|file|mimes:pdf|max:10240', // 10MB max
                'profile_id' => 'required|exists:profiles,id',
                'serial_number' => 'required|string',
                'document_id' => 'required|string'
            ]);
            
            $profile = Profile::findOrFail($request->profile_id);
            $uploadedFile = $request->file('pdf_file');
            
            // Create folder structure
            $documentTypeCode = 'TOR';
            $folderPath = "documents/profile/{$profile->id_number}/{$documentTypeCode}";
            $fullFolderPath = storage_path("app/public/{$folderPath}");
            
            if (!is_dir($fullFolderPath)) {
                mkdir($fullFolderPath, 0755, true);
            }
            
            // Save the PDF file
            $pdfFileName = "v1-{$profile->id_number}.pdf";
            $pdfFilePath = "{$fullFolderPath}/{$pdfFileName}";
            $uploadedFile->move($fullFolderPath, $pdfFileName);
            
            return response()->json([
                'success' => true,
                'message' => 'PDF saved successfully',
                'data' => [
                    'file_path' => "storage/{$folderPath}/{$pdfFileName}",
                    'file_size' => filesize($pdfFilePath)
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate TOR document with QR code and digital signature
     */
    public function generateTORDocument(Request $request)
    {
        // Authorization check for generating transcripts
        if ($response = $this->authorizeOrFail(['M-06-TRANSCRIPT-GENERATE'], "Unauthorized: You don't have permission to generate transcripts.")) {
            return $response;
        }

        try {
            $request->validate([
                'profile_id' => 'required|exists:profiles,id',
                'registrar_id' => 'required|exists:users,id',
                'doc_category' => 'required|string',
                'full_name' => 'required|string',
                'student_id' => 'required|string',
                'program' => 'required|string',
                'year_level' => 'required|string',
                'tor_coverage' => 'nullable|string',
                'pdf_data' => 'nullable|string', // Base64 PDF data from frontend
                'serialNumber' => 'nullable|string', // Pre-generated serial number
                'documentId' => 'nullable|string', // Pre-generated document ID
                'estimatedPages' => 'nullable|integer', // Estimated pages
            ]);

            // Get profile with grades
            $profile = Profile::with(['grades.subject', 'grades.schoolYear'])->findOrFail($request->profile_id);
            
            // Use pre-generated serial information from frontend if available
            if ($request->serialNumber && $request->documentId) {
                $serialNumber = $request->serialNumber;
                $documentId = $request->documentId;
                $estimatedPages = $request->estimatedPages ?? 2;
            } else {
                // Fallback: Generate serial numbers if not provided
                $gradeCount = $profile->grades ? $profile->grades->count() : 0;
                $estimatedPages = max(2, ceil($gradeCount / 15)); // Minimum 2 pages, ~15 grades per page
                
                $latestSerialEnd = IssuedDocument::withTrashed()
                    ->where('document_type', 'Transcript of Records')
                    ->whereNotNull('serial_number')
                    ->orderBy('created_at', 'desc')
                    ->value('serial_number');
                    
                $nextStart = 1;
                if ($latestSerialEnd) {
                    if (preg_match('/(\d+)-(\d+)$/', $latestSerialEnd, $matches)) {
                        $nextStart = intval($matches[2]) + 1;
                    } elseif (preg_match('/(\d+)$/', $latestSerialEnd, $matches)) {
                        $nextStart = intval($matches[1]) + 1;
                    }
                }
                
                $serialStart = str_pad($nextStart, 6, '0', STR_PAD_LEFT);
                $serialEnd = str_pad($nextStart + $estimatedPages - 1, 6, '0', STR_PAD_LEFT);
                $serialNumber = $estimatedPages > 1 ? "{$serialStart}-{$serialEnd}" : $serialStart;
                $documentId = 'TOR-' . str_pad($nextStart, 6, '0', STR_PAD_LEFT);
            }
            
            // Resolve current signature configuration
            $signatureConfig = $this->digitalSignatureService->resolveCurrentSignature();
            
            if (!$signatureConfig['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Signature configuration error: ' . $signatureConfig['message'],
                    'details' => $signatureConfig
                ], 500);
            }
            
            // Get the existing signature record (don't create a new one)
            $signature = \App\Models\Signature::find($signatureConfig['signature_id']);
            
            // Get the latest version for this profile and document type (including soft-deleted documents)
            $latestDocument = IssuedDocument::withTrashed()
                ->where('profile_id', $profile->id)
                ->where('document_type', 'Transcript of Records')
                ->orderBy('current_version', 'desc')
                ->first();
            
            $currentVersion = $latestDocument ? $latestDocument->current_version + 1.0 : 1.0;
            
            // Resolve registrar to be saved on the issued document
            $registrarId = $request->registrar_id ?? auth()->user()->id;
            
            // Get registrar user and profile information for formatted name
            $registrar = \App\Models\User::with('profile.courseInfo')->findOrFail($registrarId);
            $registrarName = $this->formatRegistrarName($registrar);
            
            // Get staff (created_by) user and profile information for formatted name
            $staff = \App\Models\User::with('profile.courseInfo')->findOrFail(auth()->user()->id);
            $staffName = $this->formatRegistrarName($staff); // Use same formatting method

            // Create issued document record
            $issuedDocument = IssuedDocument::create([
                'profile_id' => $profile->id,
                'registrar_id' => $registrarId,
                'signature_id' => $signature->id,
                'document_type' => 'Transcript of Records',
                'document_id_number' => $documentId,
                'serial_number' => $serialNumber,
                'current_version' => $currentVersion,
                'date_issued' => now(),
                'created_by' => auth()->user()->id,
            ]);
            
            // Create folder structure
            $documentTypeCode = 'TOR';
            $folderPath = "documents/profile/{$profile->id_number}/{$documentTypeCode}";
            $fullFolderPath = storage_path("app/public/{$folderPath}");
            
            if (!is_dir($fullFolderPath)) {
                mkdir($fullFolderPath, 0755, true);
            }
            
            // Handle PDF data from frontend
            $pdfFileName = "v{$currentVersion}-{$profile->id_number}.pdf";
            $pdfFilePath = "{$fullFolderPath}/{$pdfFileName}";
            
            if ($request->pdf_data) {
                // Use the real PDF generated by frontend (TranscriptOfRecordsPDF.jsx)
                $pdfContent = base64_decode($request->pdf_data);
                file_put_contents($pdfFilePath, $pdfContent);
            } else {
                // Fallback: Create a simple placeholder PDF (backend should NOT generate real PDF)
                $pdfContent = "%PDF-1.4\n% Placeholder TOR Document for {$profile->fullname}\n% Generated: " . now()->toISOString() . "\n% Real PDF should be generated by frontend TranscriptOfRecordsPDF.jsx";
                file_put_contents($pdfFilePath, $pdfContent);
            }
            
            // Calculate PDF hash from the saved PDF file
            $pdfHash = hash_file('sha256', $pdfFilePath);
            
            // Generate digital signature and QR code using resolved signature
            $encryptionService = new \App\Services\DocumentEncryptionService($this->digitalSignatureService);
            
            // Prepare verification data for QR code
            $verificationData = [
                'current_version' => (float) $issuedDocument->current_version,
                'algorithm' => $signatureConfig['algorithm'],
                'kid' => $signatureConfig['key_id'],
                'doc_id' => $issuedDocument->document_id_number,
                'type' => 'TOR',
                'registrar_id' => $profile->id_number,
                'issued_at' => $issuedDocument->date_issued->toISOString(),
                'pdf_hash' => $pdfHash
            ];
            
            $processedData = $encryptionService->processAndSaveDocumentVerification($verificationData);
            
            if (!$processedData['success']) {
                throw new \Exception('Failed to process document verification: ' . $processedData['message']);
            }
            
            // Update the issued document with hash values
            $issuedDocument->update([
                'pdf_hash' => $pdfHash,
                'signature_hash' => $processedData['digital_signature']['signature'] ?? null
            ]);
            
            // Create attachment record for the real PDF
            \App\Models\Attachment::create([
                'attachmentable_id' => $issuedDocument->id,
                'attachmentable_type' => 'App\\Models\\IssuedDocument',
                'file_path' => "storage/{$folderPath}/{$pdfFileName}",
                'file_name' => $pdfFileName,
                'file_type' => 'document',
                'file_size' => filesize($pdfFilePath),
                'file_type_origin' => 'application/pdf',
                'created_by' => auth()->user()->id,
            ]);
            

            
            // Generate QR code file
            $qrCodeFileName = "QRCode_v{$currentVersion}-{$profile->id_number}.png";
            $qrCodeFilePath = "{$fullFolderPath}/{$qrCodeFileName}";
            
            $qrResult = $encryptionService->generateQRCode($processedData['base45_qr_code'], $qrCodeFilePath);
            
            if ($qrResult['success']) {
                // Create QR code attachment
                \App\Models\Attachment::create([
                    'attachmentable_id' => $issuedDocument->id,
                    'attachmentable_type' => 'App\\Models\\IssuedDocument',
                    'file_path' => "storage/{$folderPath}/{$qrCodeFileName}",
                    'file_name' => $qrCodeFileName,
                    'file_type' => 'qr_code',
                    'file_size' => file_exists($qrCodeFilePath) ? filesize($qrCodeFilePath) : 0,
                    'file_type_origin' => 'image/png',
                    'created_by' => auth()->user()->id,
                ]);
            }
            
            // Generate final document with QR code embedded
            $finalDocFileName = "FinalDocument_v{$currentVersion}-{$profile->id_number}.pdf";
            $finalDocFilePath = "{$fullFolderPath}/{$finalDocFileName}";
            
            // For now, create a placeholder final document
            // The frontend will generate the real final document with embedded QR code
            $finalDocContent = file_get_contents($pdfFilePath);
            $finalDocContent .= "\n% Final Document with QR Code\n% QR Code File: {$qrCodeFileName}\n% Base45 Data: " . $processedData['base45_qr_code'];
            file_put_contents($finalDocFilePath, $finalDocContent);
            
            // Create final document attachment
            \App\Models\Attachment::create([
                'attachmentable_id' => $issuedDocument->id,
                'attachmentable_type' => 'App\\Models\\IssuedDocument',
                'file_path' => "storage/{$folderPath}/{$finalDocFileName}",
                'file_name' => $finalDocFileName,
                'file_type' => 'final_document',
                'file_size' => filesize($finalDocFilePath),
                'file_type_origin' => 'application/pdf',
                'created_by' => auth()->user()->id,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'TOR document generated successfully',
                'data' => [
                    'issued_document' => $issuedDocument->load(['profile', 'signature', 'attachments']),
                    'verification_data' => $processedData['original_data'],
                    'qr_code_data' => [
                        'verification_hash' => $processedData['verification_hash'],
                        'qr_code_data' => $processedData['base45_qr_code'], // This is now the hash, not base45
                        'qr_code_path' => "/storage/{$folderPath}/{$qrCodeFileName}",
                        'qr_code_full_path' => storage_path("app/public/{$folderPath}/{$qrCodeFileName}"),
                        'serial_number' => $serialNumber,
                        'verification_id' => $processedData['verification_id']
                    ],
                    'registrar_name' => $registrarName,
                    'staff_name' => $staffName,
                    'serial_number' => $serialNumber,
                    'document_id' => $documentId,
                    'current_version' => $currentVersion,
                    'files_generated' => [
                        'original_pdf' => $pdfFileName,
                        'qr_code' => $qrCodeFileName,
                        'final_document' => $finalDocFileName
                    ],
                    'folder_path' => $folderPath
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('TOR generation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate TOR document: ' . $e->getMessage()
            ], 500);
        }
    }

    public function saveFinalPDF(Request $request)
    {
        try {
            $request->validate([
                'issued_document_id' => 'required|exists:issued_documents,id',
                'pdf_data' => 'required|string', // Base64 PDF data
                'profile_id' => 'required|exists:profiles,id'
            ]);

            $issuedDocument = IssuedDocument::findOrFail($request->issued_document_id);
            $profile = Profile::findOrFail($request->profile_id);

            // Determine document type code based on the issued document type
            $typeMapping = [
                'Transcript of Records' => 'TOR',
                'Certificate of Units Earned' => 'COUE',
                'Diploma' => 'DIP',

            ];
            
            $documentTypeCode = $typeMapping[$issuedDocument->document_type] ?? 'DOC';
            $folderPath = "documents/profile/{$profile->id_number}/{$documentTypeCode}";
            $fullFolderPath = storage_path("app/public/{$folderPath}");

            if (!is_dir($fullFolderPath)) {
                mkdir($fullFolderPath, 0755, true);
            }

            // Save the final PDF with QR code embedded
            $finalDocFileName = "FinalDocument_v{$issuedDocument->current_version}-{$profile->id_number}.pdf";
            $finalDocFilePath = "{$fullFolderPath}/{$finalDocFileName}";

            // Decode and save the final PDF
            $pdfContent = base64_decode($request->pdf_data);
            file_put_contents($finalDocFilePath, $pdfContent);

            // Update the existing attachment record for the final document
            $existingAttachment = \App\Models\Attachment::where('attachmentable_id', $issuedDocument->id)
                ->where('attachmentable_type', 'App\\Models\\IssuedDocument')
                ->where('file_type', 'final_document')
                ->first();

            if ($existingAttachment) {
                $existingAttachment->update([
                    'file_size' => filesize($finalDocFilePath),
                    'updated_at' => now()
                ]);
            } else {
                // Create new attachment record if it doesn't exist
                \App\Models\Attachment::create([
                    'attachmentable_id' => $issuedDocument->id,
                    'attachmentable_type' => 'App\\Models\\IssuedDocument',
                    'file_path' => "storage/{$folderPath}/{$finalDocFileName}",
                    'file_name' => $finalDocFileName,
                    'file_type' => 'final_document',
                    'file_size' => filesize($finalDocFilePath),
                    'file_type_origin' => 'application/pdf',
                    'created_by' => auth()->user()->id,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Final PDF with QR code saved successfully',
                'data' => [
                    'final_document_path' => "/storage/{$folderPath}/{$finalDocFileName}",
                    'final_document_size' => filesize($finalDocFilePath)
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Save final PDF failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save final PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate Diploma document with QR code and digital signature
     */
    public function generateDiplomaDocument(Request $request)
    {
        // Authorization check for generating diplomas/certifications
        if ($response = $this->authorizeOrFail(['M-06-CERT-GENERATE'], "Unauthorized: You don't have permission to generate diploma documents.")) {
            return $response;
        }

        try {
            $request->validate([
                'profile_id' => 'required|exists:profiles,id',
                'registrar_id' => 'required|exists:users,id',
                'doc_category' => 'required|string',
                'cert_type' => 'required|string',
                'full_name' => 'required|string',
                'student_id' => 'required|string',
                'program' => 'required|string',
                'year_level' => 'required|string',
                'pdf_data' => 'nullable|string', // Base64 PDF data from frontend
                'serialNumber' => 'nullable|string', // Pre-generated serial number
                'documentId' => 'nullable|string', // Pre-generated document ID
            ]);

            // Get profile
            $profile = Profile::with(['grades.subject', 'grades.schoolYear'])->findOrFail($request->profile_id);
            
            // Use pre-generated serial information from frontend if available
            if ($request->serialNumber && $request->documentId) {
                $serialNumber = $request->serialNumber;
                $documentId = $request->documentId;
            } else {
                // Fallback: Generate serial numbers if not provided
                $latestSerialEnd = IssuedDocument::withTrashed()
                    ->where('document_type', 'Diploma')
                    ->whereNotNull('serial_number')
                    ->orderBy('created_at', 'desc')
                    ->value('serial_number');
                    
                $nextStart = 1;
                if ($latestSerialEnd) {
                    if (preg_match('/(\d+)$/', $latestSerialEnd, $matches)) {
                        $nextStart = intval($matches[1]) + 1;
                    }
                }
                
                $serialNumber = str_pad($nextStart, 6, '0', STR_PAD_LEFT);
                $documentId = 'DIP-' . str_pad($nextStart, 6, '0', STR_PAD_LEFT);
            }
            
            // Resolve current signature configuration
            $signatureConfig = $this->digitalSignatureService->resolveCurrentSignature();
            
            if (!$signatureConfig['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Signature configuration error: ' . $signatureConfig['message'],
                    'details' => $signatureConfig
                ], 500);
            }
            
            // Get the existing signature record (don't create a new one)
            $signature = \App\Models\Signature::find($signatureConfig['signature_id']);
            
            // Get the latest version for this profile and document type (including soft-deleted documents)
            $latestDocument = IssuedDocument::withTrashed()
                ->where('profile_id', $profile->id)
                ->where('document_type', 'Diploma')
                ->orderBy('current_version', 'desc')
                ->first();
            
            $currentVersion = $latestDocument ? $latestDocument->current_version + 1.0 : 1.0;
            
            // Resolve registrar to be saved on the issued document
            $registrarId = $request->registrar_id ?? auth()->user()->id;
            
            // Get registrar user and profile information for formatted name
            $registrar = \App\Models\User::with('profile.courseInfo')->findOrFail($registrarId);
            $registrarName = $this->formatRegistrarName($registrar);
            
            // Get staff (created_by) user and profile information for formatted name
            $staff = \App\Models\User::with('profile.courseInfo')->findOrFail(auth()->user()->id);
            $staffName = $this->formatRegistrarName($staff); // Use same formatting method

            // Get users for diploma signature positions
            $vicePresident = \App\Models\User::with('profile.courseInfo')
                ->whereHas('userRole', function($query) {
                    $query->where('user_role', 'VICE PRESIDENT FOR ACADEMIC AFFAIRS AND RESEARCH');
                })
                ->where('status', 'Active')
                ->first();
                
            $universityPresident = \App\Models\User::with('profile.courseInfo')
                ->whereHas('userRole', function($query) {
                    $query->where('user_role', 'UNIVERSITY PRESIDENT');
                })
                ->where('status', 'Active')
                ->first();
                
            $dean = \App\Models\User::with('profile.courseInfo')
                ->whereHas('userRole', function($query) {
                    $query->where('user_role', 'DEAN');
                })
                ->where('status', 'Active')
                ->first();

            // Format names for diploma signatures
            $vicePresidentName = $vicePresident ? $this->formatRegistrarName($vicePresident) : 'VICE PRESIDENT FOR ACADEMIC AFFAIRS AND RESEARCH';
            $universityPresidentName = $universityPresident ? $this->formatRegistrarName($universityPresident) : 'UNIVERSITY PRESIDENT';
            $deanName = $dean ? $this->formatRegistrarName($dean) : 'DEAN';

            // Create issued document record
            $issuedDocument = IssuedDocument::create([
                'profile_id' => $profile->id,
                'registrar_id' => $registrarId,
                'signature_id' => $signature->id,
                'document_type' => 'Diploma',
                'document_id_number' => $documentId,
                'serial_number' => $serialNumber,
                'current_version' => $currentVersion,
                'date_issued' => now(),
                'created_by' => auth()->user()->id,
            ]);
            
            // Create folder structure
            $documentTypeCode = 'DIP';
            $folderPath = "documents/profile/{$profile->id_number}/{$documentTypeCode}";
            $fullFolderPath = storage_path("app/public/{$folderPath}");
            
            if (!is_dir($fullFolderPath)) {
                mkdir($fullFolderPath, 0755, true);
            }
            
            // Handle PDF data from frontend
            $pdfFileName = "v{$currentVersion}-{$profile->id_number}.pdf";
            $pdfFilePath = "{$fullFolderPath}/{$pdfFileName}";
            
            if ($request->pdf_data) {
                // Use the real PDF generated by frontend (DiplomaPDF.jsx)
                $pdfContent = base64_decode($request->pdf_data);
                file_put_contents($pdfFilePath, $pdfContent);
            } else {
                // Fallback: Create a simple placeholder PDF (backend should NOT generate real PDF)
                $pdfContent = "%PDF-1.4\n% Placeholder Diploma Document for {$profile->fullname}\n% Generated: " . now()->toISOString() . "\n% Real PDF should be generated by frontend DiplomaPDF.jsx";
                file_put_contents($pdfFilePath, $pdfContent);
            }
            
            // Calculate PDF hash from the saved PDF file
            $pdfHash = hash_file('sha256', $pdfFilePath);
            
            // Generate digital signature and QR code using resolved signature
            $encryptionService = new \App\Services\DocumentEncryptionService($this->digitalSignatureService);
            
            // Prepare verification data for QR code
            $verificationData = [
                'current_version' => (float) $issuedDocument->current_version,
                'algorithm' => $signatureConfig['algorithm'],
                'kid' => $signatureConfig['key_id'],
                'doc_id' => $issuedDocument->document_id_number,
                'type' => 'DIP',
                'registrar_id' => $profile->id_number,
                'issued_at' => $issuedDocument->date_issued->toISOString(),
                'pdf_hash' => $pdfHash
            ];
            
            $processedData = $encryptionService->processAndSaveDocumentVerification($verificationData);
            
            if (!$processedData['success']) {
                throw new \Exception('Failed to process document verification: ' . $processedData['message']);
            }
            
            // Update the issued document with hash values
            $issuedDocument->update([
                'pdf_hash' => $pdfHash,
                'signature_hash' => $processedData['digital_signature']['signature'] ?? null
            ]);
            
            // Create attachment record for the real PDF
            \App\Models\Attachment::create([
                'attachmentable_id' => $issuedDocument->id,
                'attachmentable_type' => 'App\\Models\\IssuedDocument',
                'file_path' => "storage/{$folderPath}/{$pdfFileName}",
                'file_name' => $pdfFileName,
                'file_type' => 'document',
                'file_size' => filesize($pdfFilePath),
                'file_type_origin' => 'application/pdf',
                'created_by' => auth()->user()->id,
            ]);
            
            // Generate QR code file
            $qrCodeFileName = "QRCode_v{$currentVersion}-{$profile->id_number}.png";
            $qrCodeFilePath = "{$fullFolderPath}/{$qrCodeFileName}";
            
            $qrResult = $encryptionService->generateQRCode($processedData['base45_qr_code'], $qrCodeFilePath);
            
            if ($qrResult['success']) {
                // Create QR code attachment
                \App\Models\Attachment::create([
                    'attachmentable_id' => $issuedDocument->id,
                    'attachmentable_type' => 'App\\Models\\IssuedDocument',
                    'file_path' => "storage/{$folderPath}/{$qrCodeFileName}",
                    'file_name' => $qrCodeFileName,
                    'file_type' => 'qr_code',
                    'file_size' => file_exists($qrCodeFilePath) ? filesize($qrCodeFilePath) : 0,
                    'file_type_origin' => 'image/png',
                    'created_by' => auth()->user()->id,
                ]);
            }
            
            // Generate final document with QR code embedded
            $finalDocFileName = "FinalDocument_v{$currentVersion}-{$profile->id_number}.pdf";
            $finalDocFilePath = "{$fullFolderPath}/{$finalDocFileName}";
            
            // For now, create a placeholder final document
            // The frontend will generate the real final document with embedded QR code
            $finalDocContent = file_get_contents($pdfFilePath);
            $finalDocContent .= "\n% Final Diploma Document with QR Code\n% QR Code File: {$qrCodeFileName}\n% Base45 Data: " . $processedData['base45_qr_code'];
            file_put_contents($finalDocFilePath, $finalDocContent);
            
            // Create final document attachment
            \App\Models\Attachment::create([
                'attachmentable_id' => $issuedDocument->id,
                'attachmentable_type' => 'App\\Models\\IssuedDocument',
                'file_path' => "storage/{$folderPath}/{$finalDocFileName}",
                'file_name' => $finalDocFileName,
                'file_type' => 'final_document',
                'file_size' => filesize($finalDocFilePath),
                'file_type_origin' => 'application/pdf',
                'created_by' => auth()->user()->id,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Diploma generated successfully',
                'data' => [
                    'issued_document' => $issuedDocument->load(['profile', 'signature', 'attachments']),
                    'verification_data' => $processedData['original_data'],
                    'qr_code_data' => [
                        'verification_hash' => $processedData['verification_hash'],
                        'qr_code_data' => $processedData['base45_qr_code'], // This is now the hash, not base45
                        'qr_code_path' => "/storage/{$folderPath}/{$qrCodeFileName}",
                        'qr_code_full_path' => storage_path("app/public/{$folderPath}/{$qrCodeFileName}"),
                        'serial_number' => $serialNumber,
                        'verification_id' => $processedData['verification_id']
                    ],
                    'registrar_name' => $registrarName,
                    'staff_name' => $staffName,
                    'vice_president_name' => $vicePresidentName,
                    'university_president_name' => $universityPresidentName,
                    'dean_name' => $deanName,
                    'serial_number' => $serialNumber,
                    'document_id' => $documentId,
                    'current_version' => $currentVersion,
                    'files_generated' => [
                        'original_pdf' => $pdfFileName,
                        'qr_code' => $qrCodeFileName,
                        'final_document' => $finalDocFileName
                    ],
                    'folder_path' => $folderPath
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Diploma generation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate Diploma: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate Certificate of Units Earned document with QR code and digital signature
     */
    public function generateCertificateDocument(Request $request)
    {
        // Authorization check for generating certifications
        if ($response = $this->authorizeOrFail(['M-06-CERT-GENERATE'], "Unauthorized: You don't have permission to generate certificate documents.")) {
            return $response;
        }

        try {
            $request->validate([
                'profile_id' => 'required|exists:profiles,id',
                'registrar_id' => 'required|exists:users,id',
                'doc_category' => 'required|string',
                'cert_type' => 'required|string',
                'full_name' => 'required|string',
                'student_id' => 'required|string',
                'program' => 'required|string',
                'year_level' => 'required|string',
                'pdf_data' => 'nullable|string', // Base64 PDF data from frontend
                'serialNumber' => 'nullable|string', // Pre-generated serial number
                'documentId' => 'nullable|string', // Pre-generated document ID
            ]);

            // Get profile
            $profile = Profile::with(['grades.subject', 'grades.schoolYear'])->findOrFail($request->profile_id);
            
            // Use pre-generated serial information from frontend if available
            if ($request->serialNumber && $request->documentId) {
                $serialNumber = $request->serialNumber;
                $documentId = $request->documentId;
            } else {
                // Fallback: Generate serial numbers if not provided
                $latestSerialEnd = IssuedDocument::withTrashed()
                    ->where('document_type', 'Certificate of Units Earned')
                    ->whereNotNull('serial_number')
                    ->orderBy('created_at', 'desc')
                    ->value('serial_number');
                    
                $nextStart = 1;
                if ($latestSerialEnd) {
                    if (preg_match('/(\d+)$/', $latestSerialEnd, $matches)) {
                        $nextStart = intval($matches[1]) + 1;
                    }
                }
                
                $serialNumber = str_pad($nextStart, 6, '0', STR_PAD_LEFT);
                $documentId = 'COUE-' . str_pad($nextStart, 6, '0', STR_PAD_LEFT);
            }
            
            // Resolve current signature configuration
            $signatureConfig = $this->digitalSignatureService->resolveCurrentSignature();
            
            if (!$signatureConfig['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Signature configuration error: ' . $signatureConfig['message'],
                    'details' => $signatureConfig
                ], 500);
            }
            
            // Get the existing signature record (don't create a new one)
            $signature = \App\Models\Signature::find($signatureConfig['signature_id']);
            
            // Get the latest version for this profile and document type (including soft-deleted documents)
            $latestDocument = IssuedDocument::withTrashed()
                ->where('profile_id', $profile->id)
                ->where('document_type', 'Certificate of Units Earned')
                ->orderBy('current_version', 'desc')
                ->first();
            
            $currentVersion = $latestDocument ? $latestDocument->current_version + 1.0 : 1.0;
            
            // Resolve registrar to be saved on the issued document
            $registrarId = $request->registrar_id ?? auth()->user()->id;
            
            // Get registrar user and profile information for formatted name
            $registrar = \App\Models\User::with('profile.courseInfo')->findOrFail($registrarId);
            $registrarName = $this->formatRegistrarName($registrar);
            
            // Get staff (created_by) user and profile information for formatted name
            $staff = \App\Models\User::with('profile.courseInfo')->findOrFail(auth()->user()->id);
            $staffName = $this->formatRegistrarName($staff); // Use same formatting method

            // Get users for diploma signature positions (if generating a diploma)
            $vicePresident = \App\Models\User::with('profile.courseInfo')
                ->whereHas('userRole', function($query) {
                    $query->where('user_role', 'VICE PRESIDENT FOR ACADEMIC AFFAIRS AND RESEARCH');
                })
                ->where('status', 'Active')
                ->first();
                
            $universityPresident = \App\Models\User::with('profile.courseInfo')
                ->whereHas('userRole', function($query) {
                    $query->where('user_role', 'UNIVERSITY PRESIDENT');
                })
                ->where('status', 'Active')
                ->first();
                
            $dean = \App\Models\User::with('profile.courseInfo')
                ->whereHas('userRole', function($query) {
                    $query->where('user_role', 'DEAN');
                })
                ->where('status', 'Active')
                ->first();

            // Format names for diploma signatures
            $vicePresidentName = $vicePresident ? $this->formatRegistrarName($vicePresident) : 'VICE PRESIDENT FOR ACADEMIC AFFAIRS AND RESEARCH';
            $universityPresidentName = $universityPresident ? $this->formatRegistrarName($universityPresident) : 'UNIVERSITY PRESIDENT';
            $deanName = $dean ? $this->formatRegistrarName($dean) : 'DEAN';

            // Create issued document record
            $issuedDocument = IssuedDocument::create([
                'profile_id' => $profile->id,
                'registrar_id' => $registrarId,
                'signature_id' => $signature->id,
                'document_type' => 'Certificate of Units Earned',
                'document_id_number' => $documentId,
                'serial_number' => $serialNumber,
                'current_version' => $currentVersion,
                'date_issued' => now(),
                'created_by' => auth()->user()->id,
            ]);
            
            // Create folder structure
            $documentTypeCode = 'COUE';
            $folderPath = "documents/profile/{$profile->id_number}/{$documentTypeCode}";
            $fullFolderPath = storage_path("app/public/{$folderPath}");
            
            if (!is_dir($fullFolderPath)) {
                mkdir($fullFolderPath, 0755, true);
            }
            
            // Handle PDF data from frontend
            $pdfFileName = "v{$currentVersion}-{$profile->id_number}.pdf";
            $pdfFilePath = "{$fullFolderPath}/{$pdfFileName}";
            
            if ($request->pdf_data) {
                // Use the real PDF generated by frontend (CertificateOfUnitsEarnedPDF.jsx)
                $pdfContent = base64_decode($request->pdf_data);
                file_put_contents($pdfFilePath, $pdfContent);
            } else {
                // Fallback: Create a simple placeholder PDF (backend should NOT generate real PDF)
                $pdfContent = "%PDF-1.4\n% Placeholder Certificate Document for {$profile->fullname}\n% Generated: " . now()->toISOString() . "\n% Real PDF should be generated by frontend CertificateOfUnitsEarnedPDF.jsx";
                file_put_contents($pdfFilePath, $pdfContent);
            }
            
            // Calculate PDF hash from the saved PDF file
            $pdfHash = hash_file('sha256', $pdfFilePath);
            
            // Generate digital signature and QR code using resolved signature
            $encryptionService = new \App\Services\DocumentEncryptionService($this->digitalSignatureService);
            
            // Prepare verification data for QR code
            $verificationData = [
                'current_version' => (float) $issuedDocument->current_version,
                'algorithm' => $signatureConfig['algorithm'],
                'kid' => $signatureConfig['key_id'],
                'doc_id' => $issuedDocument->document_id_number,
                'type' => 'COUE',
                'registrar_id' => $profile->id_number,
                'issued_at' => $issuedDocument->date_issued->toISOString(),
                'pdf_hash' => $pdfHash
            ];
            
            $processedData = $encryptionService->processAndSaveDocumentVerification($verificationData);
            
            if (!$processedData['success']) {
                throw new \Exception('Failed to process document verification: ' . $processedData['message']);
            }
            
            // Update the issued document with hash values
            $issuedDocument->update([
                'pdf_hash' => $pdfHash,
                'signature_hash' => $processedData['digital_signature']['signature'] ?? null
            ]);
            
            // Create attachment record for the real PDF
            \App\Models\Attachment::create([
                'attachmentable_id' => $issuedDocument->id,
                'attachmentable_type' => 'App\\Models\\IssuedDocument',
                'file_path' => "storage/{$folderPath}/{$pdfFileName}",
                'file_name' => $pdfFileName,
                'file_type' => 'document',
                'file_size' => filesize($pdfFilePath),
                'file_type_origin' => 'application/pdf',
                'created_by' => auth()->user()->id,
            ]);
            
            // Generate QR code file
            $qrCodeFileName = "QRCode_v{$currentVersion}-{$profile->id_number}.png";
            $qrCodeFilePath = "{$fullFolderPath}/{$qrCodeFileName}";
            
            $qrResult = $encryptionService->generateQRCode($processedData['base45_qr_code'], $qrCodeFilePath);
            
            if ($qrResult['success']) {
                // Create QR code attachment
                \App\Models\Attachment::create([
                    'attachmentable_id' => $issuedDocument->id,
                    'attachmentable_type' => 'App\\Models\\IssuedDocument',
                    'file_path' => "storage/{$folderPath}/{$qrCodeFileName}",
                    'file_name' => $qrCodeFileName,
                    'file_type' => 'qr_code',
                    'file_size' => file_exists($qrCodeFilePath) ? filesize($qrCodeFilePath) : 0,
                    'file_type_origin' => 'image/png',
                    'created_by' => auth()->user()->id,
                ]);
            }
            
            // Generate final document with QR code embedded
            $finalDocFileName = "FinalDocument_v{$currentVersion}-{$profile->id_number}.pdf";
            $finalDocFilePath = "{$fullFolderPath}/{$finalDocFileName}";
            
            // For now, create a placeholder final document
            // The frontend will generate the real final document with embedded QR code
            $finalDocContent = file_get_contents($pdfFilePath);
            $finalDocContent .= "\n% Final Certificate Document with QR Code\n% QR Code File: {$qrCodeFileName}\n% Base45 Data: " . $processedData['base45_qr_code'];
            file_put_contents($finalDocFilePath, $finalDocContent);
            
            // Create final document attachment
            \App\Models\Attachment::create([
                'attachmentable_id' => $issuedDocument->id,
                'attachmentable_type' => 'App\\Models\\IssuedDocument',
                'file_path' => "storage/{$folderPath}/{$finalDocFileName}",
                'file_name' => $finalDocFileName,
                'file_type' => 'final_document',
                'file_size' => filesize($finalDocFilePath),
                'file_type_origin' => 'application/pdf',
                'created_by' => auth()->user()->id,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Certificate of Units Earned generated successfully',
                'data' => [
                    'issued_document' => $issuedDocument->load(['profile', 'signature', 'attachments']),
                    'verification_data' => $processedData['original_data'],
                    'qr_code_data' => [
                        'verification_hash' => $processedData['verification_hash'],
                        'qr_code_data' => $processedData['base45_qr_code'], // This is now the hash, not base45
                        'qr_code_path' => "/storage/{$folderPath}/{$qrCodeFileName}",
                        'qr_code_full_path' => storage_path("app/public/{$folderPath}/{$qrCodeFileName}"),
                        'serial_number' => $serialNumber,
                        'verification_id' => $processedData['verification_id']
                    ],
                    'registrar_name' => $registrarName,
                    'staff_name' => $staffName,
                    'vice_president_name' => $vicePresidentName,
                    'university_president_name' => $universityPresidentName,
                    'dean_name' => $deanName,
                    'serial_number' => $serialNumber,
                    'document_id' => $documentId,
                    'current_version' => $currentVersion,
                    'files_generated' => [
                        'original_pdf' => $pdfFileName,
                        'qr_code' => $qrCodeFileName,
                        'final_document' => $finalDocFileName
                    ],
                    'folder_path' => $folderPath
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Certificate generation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate Certificate of Units Earned: ' . $e->getMessage()
            ], 500);
        }
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
            'profile_id' => 'required',
            'registrar_id' => 'required',
            'signature_id' => 'required',
            'document_type' => 'required',
            'current_version' => 'required',
            'date_issued' => 'required',
            'date_revoked' => 'required',
            'serial_number' => 'required',
            'document_id_number' => 'required',
            'document_file' => 'nullable|file',
            'final_document_file' => 'nullable|file',
        ]);

        $data = [
            'profile_id' => $request->profile_id,
            'registrar_id' => $request->registrar_id,
            'signature_id' => $request->signature_id,
            'document_type' => $request->document_type,
            'document_version' => $request->current_version,
            'current_version' => $request->current_version,
            'date_issued' => $request->date_issued,
            'date_revoked' => $request->date_revoked,
            'serial_number' => $request->serial_number,
            'document_id_number' => $request->document_id_number,
            'registrar_id' => auth()->user()->id,
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


        $issuedDocument = IssuedDocument::updateOrCreate([
            "id" => $request->id,
        ], $data);

        if ($issuedDocument) {
            // Handle attachment uploads if provided
            if ($request->hasFile('document_file') || $request->hasFile('final_document_file')) {
                $profile = Profile::find($request->profile_id);

                if ($profile) {
                    // Map document type to short code for folder naming
                    $typeMapping = [
                        'Transcript of Records' => 'TOR',
                        'Certificate of Units Earned' => 'COUE', 
                        'Diploma' => 'DIP',
                    ];

                    $documentTypeCode = $typeMapping[$request->document_type] ?? 'DOC';
                    
                    // Build folder structure: documents/profile/{id_number}/{document_type}/
                    $folderName = "documents/profile/{$profile->id_number}/{$documentTypeCode}";

                    // Handle document_file upload
                    if ($request->hasFile('document_file')) {
                        $uploadedFile = $request->file('document_file');
                        $ext = $uploadedFile->getClientOriginalExtension();

                        // Build filename: v{current_version}-{id_number}.{ext}
                        $displayFileName = "v{$request->current_version}-{$profile->id_number}" . ($ext ? ('.' . $ext) : '');

                        $this->create_attachment($issuedDocument, $uploadedFile, [
                            "folder_name" => $folderName,
                            "file_description" => "Issued Document",
                            "file_name" => $displayFileName,
                        ]);
                    }

                    // Handle final_document_file upload
                    if ($request->hasFile('final_document_file')) {
                        $uploadedFinalFile = $request->file('final_document_file');
                        $finalExt = $uploadedFinalFile->getClientOriginalExtension();

                        // Build filename: v{current_version}-{id_number}-final.{ext}
                        $finalDisplayFileName = "v{$request->current_version}-{$profile->id_number}-final" . ($finalExt ? ('.' . $finalExt) : '');

                        $this->create_attachment($issuedDocument, $uploadedFinalFile, [
                            "folder_name" => $folderName,
                            "file_description" => "Final Issued Document",
                            "file_name" => $finalDisplayFileName,
                        ]);
                    }
                }
            }
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
        $data = IssuedDocument::find($id);

        return response()->json([
            'data' => $data,
            'success' => true
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, IssuedDocument $issuedDocument)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function issued_document_archived(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Data failed to " . ($request->isTrash ? "restore" : "archive")
        ];

        if ($request->ids && count($request->ids) > 0) {
            if ($request->isTrash) {
                IssuedDocument::whereIn("id", $request->ids)->restore();
                // Update the 'updated_by' field
                $data = [
                    "deleted_by" => null,
                    "updated_by" => auth()->id(),
                ];
                IssuedDocument::whereIn("id", $request->ids)->update($data);
            } else {
                $data = [
                    "deleted_at" => now(),
                    "deleted_by" => auth()->id(),
                ];
                IssuedDocument::whereIn("id", $request->ids)->update($data);
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

        $issuedDocument = IssuedDocument::find($id);


        if ($issuedDocument) {
            if ($issuedDocument->delete()) {

                $ret = [
                    "success" => true,
                    "message" => "Data deleted successfully"
                ];
            }
        }
        return response()->json($ret, 200);
    }

    /**
     * Revoke an issued document
     */
    public function revokeDocument(Request $request)
    {
        // Authorization check for revoking documents
        $documentType = strtolower($request->document_type ?? '');
        $permissionCodes = [];
        
        if (str_contains($documentType, 'transcript')) {
            $permissionCodes[] = 'M-06-TRANSCRIPT-REVOKE';
        } elseif (str_contains($documentType, 'cert') || str_contains($documentType, 'diploma')) {
            $permissionCodes[] = 'M-06-CERT-REVOKE';
        }
        
        if (!empty($permissionCodes) && ($response = $this->authorizeOrFail($permissionCodes, "Unauthorized: You don't have permission to revoke this document type."))) {
            return $response;
        }

        try {
            $request->validate([
                'id' => 'required|exists:issued_documents,id',
                'document_id' => 'required|string',
                'revocation_reason' => 'nullable|string|max:500'
            ]);

            $document = IssuedDocument::with(['profile', 'signature'])->findOrFail($request->id);
            
            // Check if document is already revoked
            if ($document->deleted_at || $document->date_revoked) {
                return response()->json([
                    'success' => false,
                    'message' => 'This document has already been revoked'
                ], 400);
            }

            // Update document with revocation details
            $document->date_revoked = now();
            $document->revocation_reason = $request->revocation_reason ?: 'No reason provided';
            $document->deleted_by = auth()->user()->id;
            $document->deleted_at = now();
            $document->save();

            // Log the revocation action
            \Log::info('Document revoked', [
                'document_id' => $document->id,
                'document_number' => $document->document_id_number,
                'serial_number' => $document->serial_number,
                'revocation_reason' => $document->revocation_reason,
                'revoked_by' => auth()->user()->id,
                'revoked_at' => now()->toISOString()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document has been permanently revoked',
                'data' => [
                    'document_id' => $document->document_id_number,
                    'serial_number' => $document->serial_number,
                    'revoked_at' => now()->toISOString(),
                    'revoked_by' => auth()->user()->username
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to revoke document: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format registrar name in the required format: Firstname M. Lastname, COURSE_CODE
     */
    private function formatRegistrarName($user)
    {
        if (!$user || !$user->profile) {
            return 'Registrar Name';
        }

        $profile = $user->profile;
        $firstname = $profile->firstname ?? '';
        $middlename = $profile->middlename ?? '';
        $lastname = $profile->lastname ?? '';

        // Format middle name to initial if it exists
        $middleInitial = '';
        if (!empty($middlename) && trim($middlename) !== '') {
            $middleInitial = strtoupper(substr(trim($middlename), 0, 1)) . '.';
        }

        // Construct the formatted name
        $formattedName = trim("{$firstname} {$middleInitial} {$lastname}");
        
        // Remove extra spaces
        $formattedName = preg_replace('/\s+/', ' ', $formattedName);

        // Add course code if available
        if ($profile->courseInfo && !empty($profile->courseInfo->course_code)) {
            $formattedName .= ', ' . $profile->courseInfo->course_code;
        }

        return !empty($formattedName) ? $formattedName : 'Registrar Name';
    }

    /**
     * Verify document by hash from QR code
     */
    public function verifyDocumentByHash(Request $request)
    {
        try {
            $request->validate([
                'hash' => 'required|string|size:64' // SHA256 hash is 64 characters
            ]);

            $encryptionService = new \App\Services\DocumentEncryptionService($this->digitalSignatureService);

            // Get verification data by hash
            $verificationResult = $encryptionService->getVerificationDataByHash($request->hash);

            if (!$verificationResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document verification failed: Invalid QR code'
                ], 404);
            }

            $verificationData = $verificationResult['data'];

            // Extract document ID from verification data and find the issued document
            $documentId = $verificationData['document_id'];
            
            if (!$documentId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid verification data: document ID not found'
                ], 400);
            }

            // Find the issued document by document_id_number instead of issued_document_id
            $issuedDocument = IssuedDocument::with(['profile', 'signature'])
                ->where('document_id_number', $documentId)
                ->first();

            if (!$issuedDocument) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }

            // Check if document is still active (not revoked)
            if ($issuedDocument->deleted_at || $issuedDocument->date_revoked) {
                return response()->json([
                    'success' => false,
                    'message' => 'This document has been revoked and is no longer valid',
                    'document_status' => 'revoked',
                    'revoked_at' => $issuedDocument->date_revoked ?? $issuedDocument->deleted_at
                ], 400);
            }

            // Return verification details
            return response()->json([
                'success' => true,
                'message' => 'Document verified successfully',
                'verification_data' => [
                    'document_type' => $issuedDocument->document_type,
                    'document_id' => $issuedDocument->document_id_number,
                    'serial_number' => $issuedDocument->serial_number,
                    'student_name' => $issuedDocument->profile->fullname ?? 
                        ($issuedDocument->profile->firstname . ' ' . $issuedDocument->profile->lastname),
                    'student_id' => $issuedDocument->profile->id_number,
                    'date_issued' => $issuedDocument->date_issued ? 
                        (is_string($issuedDocument->date_issued) ? 
                            \Carbon\Carbon::parse($issuedDocument->date_issued)->format('F d, Y') : 
                            $issuedDocument->date_issued->format('F d, Y')) : 
                        'N/A',
                    'current_version' => $issuedDocument->current_version,
                    'algorithm' => $verificationData['algorithm'],
                    'verification_status' => 'valid',
                    'verified_at' => now()->toISOString()
                ],
                'decoded_verification_data' => $verificationData['decoded_data']
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid hash format',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Document verification by hash failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
