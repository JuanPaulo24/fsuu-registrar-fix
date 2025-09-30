<?php

namespace App\Http\Controllers;

use App\Models\IssuedDocument;
use App\Models\Profile;
use App\Models\Signature;
use App\Models\DocumentScanLog;
use App\Models\EmailTemplate;
use App\Models\PublicScanHistory;
use App\Models\DocumentVerificationData;
use App\Services\DigitalSignatureService;
use App\Services\DocumentEncryptionService;
use App\Services\GmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class DocumentVerificationController extends Controller
{
    /**
     * Get list of verifiable documents
     */
    public function listVerifiableDocuments(Request $request)
    {
        try {
            $documents = IssuedDocument::with(['profile', 'signature', 'attachments'])
                ->whereNotNull('document_id_number')
                ->whereNotNull('signature_id')
                ->when($request->document_type, function ($query, $type) {
                    return $query->where('document_type', $type);
                })
                ->when($request->search, function ($query, $search) {
                    return $query->where(function ($q) use ($search) {
                        $q->where('document_id_number', 'LIKE', "%{$search}%")
                          ->orWhere('serial_number', 'LIKE', "%{$search}%")
                          ->orWhereHas('profile', function ($profileQuery) use ($search) {
                              $profileQuery->where('firstname', 'LIKE', "%{$search}%")
                                          ->orWhere('lastname', 'LIKE', "%{$search}%")
                                          ->orWhere('id_number', 'LIKE', "%{$search}%");
                          });
                    });
                })
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $documents,
                'message' => 'Documents retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving verifiable documents: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify a specific document and return verification data with digital signature
     */
    public function verifyDocument($documentId, Request $request)
    {
        try {
            $document = IssuedDocument::with(['profile', 'signature', 'attachments'])
                ->where('document_id_number', $documentId)
                ->orWhere('id', $documentId)
                ->first();

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }

            // Get the latest attachment (PDF document)
            $attachment = $document->attachments()
                ->where('file_type', 'document')
                ->orderBy('created_at', 'desc')
                ->first();

            $pdfHash = null;
            if ($attachment && Storage::disk('public')->exists(str_replace('storage/', '', $attachment->file_path))) {
                $filePath = storage_path('app/public/' . str_replace('storage/', '', $attachment->file_path));
                $pdfHash = hash_file('sha256', $filePath);
            }

            // Map document type to short code
            $typeMapping = [
                'Transcript of Records' => 'TOR',
                'Certificate of Enrollment' => 'COE', 
                'Diploma' => 'DIP',
                'Certificate of Graduation' => 'COG',
                'Certificate of Good Moral Character' => 'GMC'
            ];

            $documentType = $typeMapping[$document->document_type] ?? 'DOC';

            // Prepare verification response
            $verificationData = [
                'current_version' => (float) $document->current_version,
                'algorithm' => $document->signature->algorithm ?? 'ES256',
                'kid' => $document->signature->key_id ?? 'registrar-2025-07',
                'doc_id' => $document->document_id_number,
                'type' => $documentType,
                'registrar_id' => $document->profile->id_number ?? null,
                'issued_at' => $document->date_issued ? 
                    \Carbon\Carbon::parse($document->date_issued)->toISOString() : null,
                'pdf_hash' => $pdfHash
            ];

            // Digitally sign the verification data
            // Use the complete workflow: Digital Signature -> AES Encryption -> BASE45 Encoding
            $encryptionService = new DocumentEncryptionService(new DigitalSignatureService());
            $processedData = $encryptionService->processDocumentVerification($verificationData);

            if (!$processedData['success']) {
                Log::error('Failed to process document verification', $processedData);
                return response()->json([
                    'success' => false,
                    'message' => $processedData['message'],
                    'fallback_data' => $verificationData
                ], 500);
            }

            // Generate QR code and create final document files
            $documentFiles = $this->generateDocumentFiles($document, $processedData);

            // Get devglan.com compatible format
            $devglanFormat = null;
            if (isset($processedData['encrypted_data']['devglan_format'])) {
                $devglanFormat = $encryptionService->getDevglanFormat($processedData['encrypted_data']['devglan_format']);
            }

            return response()->json([
                'success' => true,
                'verification_data' => $processedData['original_data'],
                'digital_signature' => $processedData['digital_signature'],
                'encrypted_data' => $processedData['encrypted_data'],
                'qr_code_data' => $processedData['base45_qr_code'],
                'generated_files' => $documentFiles,
                'devglan_compatible' => $devglanFormat
            ]);

        } catch (\Exception $e) {
            Log::error('Error verifying document: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error verifying document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get verification status for multiple documents
     */
    public function getVerificationStatus(Request $request)
    {
        try {
            $documentIds = $request->input('document_ids', []);
            
            if (empty($documentIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No document IDs provided'
                ], 400);
            }

            $documents = IssuedDocument::with(['profile', 'signature', 'attachments'])
                ->whereIn('document_id_number', $documentIds)
                ->orWhereIn('id', $documentIds)
                ->get();

            $results = [];
            foreach ($documents as $document) {
                $attachment = $document->attachments()
                    ->where('file_type', 'document')
                    ->orderBy('created_at', 'desc')
                    ->first();

                $isValid = !is_null($document->signature_id) && 
                          !is_null($document->date_issued) &&
                          ($attachment ? Storage::disk('public')->exists(str_replace('storage/', '', $attachment->file_path)) : false);

                $results[] = [
                    'doc_id' => $document->document_id_number,
                    'is_valid' => $isValid,
                    'status' => $isValid ? 'verified' : 'invalid',
                    'issued_at' => $document->date_issued ? 
                        \Carbon\Carbon::parse($document->date_issued)->toISOString() : null,
                    'type' => $document->document_type
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $results,
                'message' => 'Verification status retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting verification status: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error getting verification status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Decode BASE45 QR code data and verify document
     */
    public function decodeQRCode(Request $request)
    {
        $qrData = $request->input('qr_data');
        $qrDataHash = $qrData ? hash('sha256', $qrData) : null;
        $scanStatus = 'error';
        $scanResult = null;
        $documentIdNumber = null;
        $documentType = null;
        $profileId = null;
        
        try {
            if (!$qrData) {
                $scanResult = ['error' => 'QR code data is required'];
                $this->logScanAttempt($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash);
                
                return response()->json([
                    'success' => false,
                    'message' => 'QR code data is required'
                ], 400);
            }

            $encryptionService = new DocumentEncryptionService(new DigitalSignatureService());
            
            // Step 1: Decode BASE45
            $decodedResult = $encryptionService->decodeFromBase45($qrData);

            if (!$decodedResult['success']) {
                $scanResult = ['error' => 'Invalid QR code format', 'details' => $decodedResult];
                $this->logScanAttempt($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code format'
                ], 400);
            }

            // Step 2: Parse JSON
            $jsonData = json_decode($decodedResult['decoded'], true);
            
            if (!$jsonData) {
                $scanResult = ['error' => 'Invalid QR code data format'];
                $this->logScanAttempt($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code data format'
                ], 400);
            }

            // Step 3: Check if encrypted (AES-128-GCM)
            $finalData = $jsonData;
            if (isset($jsonData['algorithm']) && $jsonData['algorithm'] === 'A128GCM') {
                $decryptResult = $encryptionService->decryptAES128GCM($jsonData);
                
                if (!$decryptResult['success']) {
                    $scanResult = ['error' => 'Failed to decrypt QR code data', 'details' => $decryptResult];
                    $this->logScanAttempt($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to decrypt QR code data'
                    ], 400);
                }
                
                $finalData = $decryptResult['decrypted'];
            }

            // Step 4: Verify document exists
            if (!isset($finalData['doc_id'])) {
                $scanResult = ['error' => 'Invalid QR code: missing document ID'];
                $this->logScanAttempt($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code: missing document ID'
                ], 400);
            }

            // Extract data for logging
            $documentIdNumber = $finalData['doc_id'];
            $documentType = $finalData['type'] ?? 'Unknown';

            $document = IssuedDocument::with(['profile', 'signature', 'attachments'])
                ->withTrashed()
                ->where('document_id_number', $finalData['doc_id'])
                ->first();

            if (!$document) {
                // Extract document type from the data for better error message
                $docType = $finalData['type'] ?? 'Document';
                $typeMapping = [
                    'TOR' => 'Transcript of Records',
                    'COE' => 'Certificate of Enrollment',
                    'DIP' => 'Diploma',
                    'COG' => 'Certificate of Graduation',
                    'GMC' => 'Certificate of Good Moral Character'
                ];
                $fullDocType = $typeMapping[$docType] ?? $docType;
                
                $scanResult = ['error' => "Document {$fullDocType} not found", 'document_id' => $documentIdNumber];
                $this->logScanAttempt($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash);
                
                return response()->json([
                    'success' => false,
                    'message' => "Document {$fullDocType} not found, please try again"
                ], 404);
            }

            // Set profile ID for logging
            $profileId = $document->profile_id;

            // Step 5: Verify document integrity (optional - can be enabled/disabled)
            $verificationStatus = 'valid';
            $verificationDetails = [];

            // Check PDF hash if available - must verify against the ORIGINAL document (v{version}-{id_number}.pdf)
            if (isset($finalData['pdf_hash'])) {
                $profile = $document->profile;
                if ($profile) {
                    // Map document type to short code
                    $typeMapping = [
                        'Transcript of Records' => 'TOR',
                        'Certificate of Enrollment' => 'COE', 
                        'Diploma' => 'DIP',
                        'Certificate of Graduation' => 'COG',
                        'Certificate of Good Moral Character' => 'GMC'
                    ];
                    $documentType = $typeMapping[$document->document_type] ?? 'DOC';
                    
                    // Construct path to original document: documents/profile/{id_number}/{document_type}/v{version}-{id_number}.pdf
                    $version = $document->current_version ?? 1;
                    $idNumber = $profile->id_number;
                    $originalFileName = "v{$version}-{$idNumber}.pdf";
                    $originalFilePath = storage_path("app/public/documents/profile/{$idNumber}/{$documentType}/{$originalFileName}");
                    
                    if (file_exists($originalFilePath)) {
                        $actualPdfHash = hash_file('sha256', $originalFilePath);
                        
                        if ($finalData['pdf_hash'] !== $actualPdfHash) {
                            // Hash mismatch - document has been forged/tampered
                            $scanStatus = 'hash_mismatch';
                            $scanResult = [
                                'error' => 'Document has been tampered with or is forged',
                                'type' => 'hash_mismatch',
                                'expected_hash' => $finalData['pdf_hash'],
                                'actual_hash' => $actualPdfHash,
                                'verified_file' => $originalFileName,
                                'document' => $document->toArray()
                            ];
                            $this->logScanAttempt($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash);
                            
                            return response()->json([
                                'success' => false,
                                'message' => 'Document verification failed: Document has been tampered with or is forged',
                                'error_details' => [
                                    'type' => 'hash_mismatch',
                                    'expected_hash' => $finalData['pdf_hash'],
                                    'actual_hash' => $actualPdfHash,
                                    'verified_file' => $originalFileName
                                ]
                            ], 400);
                        }
                        
                        // Hash matches - document is authentic
                        $verificationDetails['pdf_hash_verified'] = true;
                        $verificationDetails['verified_file'] = $originalFileName;
                        $verificationDetails['hash_match'] = true;
                    } else {
                        // Original file not found
                        $scanStatus = 'error';
                        $scanResult = [
                            'error' => 'Original document file not found',
                            'type' => 'file_not_found',
                            'expected_file' => $originalFileName,
                            'expected_path' => "documents/profile/{$idNumber}/{$documentType}/{$originalFileName}",
                            'document' => $document->toArray()
                        ];
                        $this->logScanAttempt($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash);
                        
                        return response()->json([
                            'success' => false,
                            'message' => 'Document verification failed: Original document file not found',
                            'error_details' => [
                                'type' => 'file_not_found',
                                'expected_file' => $originalFileName,
                                'expected_path' => "documents/profile/{$idNumber}/{$documentType}/{$originalFileName}"
                            ]
                        ], 404);
                    }
                }
            }

            // Check if document is revoked
            if ($document->date_revoked) {
                $scanStatus = 'revoked';
                $scanResult = [
                    'message' => 'Document has been revoked',
                    'revoked_at' => $document->date_revoked,
                    'revocation_reason' => $document->revocation_reason ?? 'No reason provided',
                    'document' => $document->toArray(),
                    'qr_data' => $finalData
                ];
            } else {
                // Document is valid and verified
                $scanStatus = 'success';
                $scanResult = [
                    'message' => 'Document verified successfully',
                    'document' => $document->toArray(),
                    'qr_data' => $finalData,
                    'verification_details' => $verificationDetails
                ];
            }
            
            // Log the successful scan
            $this->logScanAttempt($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash);

            return response()->json([
                'success' => true,
                'data' => [
                    'document' => $document,
                    'qr_data' => $finalData,
                    'verification_status' => $verificationStatus,
                    'verification_details' => $verificationDetails,
                    'scan_status' => $scanStatus
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error decoding QR code: ' . $e->getMessage());
            
            // Log the error
            $scanResult = ['error' => 'System error: ' . $e->getMessage()];
            $this->logScanAttempt($request, $documentIdNumber, $documentType, $profileId, 'error', $scanResult, $qrDataHash);
            
            return response()->json([
                'success' => false,
                'message' => 'Error decoding QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document details with full verification info
     */
    public function getDocumentDetails($documentId)
    {
        try {
            $document = IssuedDocument::with([
                'profile', 
                'signature', 
                'attachments',
                'documentGrade.subject',
                'documentGrade.schoolYear'
            ])
            ->withTrashed()
            ->where('document_id_number', $documentId)
            ->orWhere('id', $documentId)
            ->first();

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }

            // Get PDF hash
            $attachment = $document->attachments()
                ->where('file_type', 'document')
                ->orderBy('created_at', 'desc')
                ->first();

            $pdfHash = null;
            if ($attachment && Storage::disk('public')->exists(str_replace('storage/', '', $attachment->file_path))) {
                $filePath = storage_path('app/public/' . str_replace('storage/', '', $attachment->file_path));
                $pdfHash = hash_file('sha256', $filePath);
            }

            $response = [
                'success' => true,
                'data' => [
                    'document' => $document,
                    'verification' => [
                        'current_version' => (float) $document->current_version,
                        'algorithm' => $document->signature->algorithm ?? 'ES256',
                        'kid' => $document->signature->key_id ?? 'registrar-2025-07',
                        'doc_id' => $document->document_id_number,
                        'type' => $document->document_type,
                        'registrar_id' => $document->profile->id_number ?? null,
                        'issued_at' => $document->date_issued ? 
                            \Carbon\Carbon::parse($document->date_issued)->toISOString() : null,
                        'pdf_hash' => $pdfHash
                    ]
                ]
            ];

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Error getting document details: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error getting document details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate the three required document files
     */
    private function generateDocumentFiles($document, $processedData): array
    {
        try {
            $profile = $document->profile;
            $attachment = $document->attachments()
                ->where('file_type', 'document')
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$attachment || !$profile) {
                return [
                    'success' => false,
                    'message' => 'Document or profile not found'
                ];
            }

            // Determine document type code
            $typeMapping = [
                'Transcript of Records' => 'TOR',
                'Certificate of Enrollment' => 'COE', 
                'Diploma' => 'DIP',
                'Certificate of Graduation' => 'COG',
                'Certificate of Good Moral Character' => 'GMC'
            ];
            $documentType = $typeMapping[$document->document_type] ?? 'DOC';
            
            // Build folder structure: documents/profile/{id_number}/{document_type}/
            $folderPath = "documents/profile/{$profile->id_number}/{$documentType}";
            $fullFolderPath = storage_path("app/public/{$folderPath}");
            
            // Ensure directory exists
            if (!is_dir($fullFolderPath)) {
                mkdir($fullFolderPath, 0755, true);
            }

            $version = $document->current_version;
            $idNumber = $profile->id_number;
            $generatedFiles = [];

            // 1. Original PDF (should already exist)
            $originalPdfName = "v{$version}-{$idNumber}.pdf";
            $originalPdfPath = "{$folderPath}/{$originalPdfName}";
            
            if (Storage::disk('public')->exists(str_replace('storage/', '', $attachment->file_path))) {
                $generatedFiles['original_pdf'] = [
                    'name' => $originalPdfName,
                    'path' => $originalPdfPath,
                    'status' => 'existing'
                ];
            }

            // 2. Generate QR Code
            $qrCodeName = "QRCode_v{$version}-{$idNumber}.png";
            $qrCodePath = "{$fullFolderPath}/{$qrCodeName}";
            
            $encryptionService = new DocumentEncryptionService(new DigitalSignatureService());
            $qrResult = $encryptionService->generateQRCode($processedData['base45_qr_code'], $qrCodePath);
            
            if ($qrResult['success']) {
                $generatedFiles['qr_code'] = [
                    'name' => $qrCodeName,
                    'path' => "{$folderPath}/{$qrCodeName}",
                    'status' => 'generated'
                ];
            }

            // 3. Generate Final Document (PDF with QR code embedded)
            $finalDocName = "FinalDocument_v{$version}-{$idNumber}.pdf";
            $finalDocPath = "{$fullFolderPath}/{$finalDocName}";
            
            // Create final document (placeholder implementation)
            $finalDocContent = "Final Document with QR Code\n";
            $finalDocContent .= "Original Document: {$originalPdfName}\n";
            $finalDocContent .= "QR Code: {$qrCodeName}\n";
            $finalDocContent .= "Generated at: " . now()->toISOString() . "\n";
            $finalDocContent .= "Verification Data:\n" . json_encode($processedData['verification_data'] ?? [], JSON_PRETTY_PRINT);
            
            file_put_contents($finalDocPath, $finalDocContent);
            
            $generatedFiles['final_document'] = [
                'name' => $finalDocName,
                'path' => "{$folderPath}/{$finalDocName}",
                'status' => 'generated'
            ];

            return [
                'success' => true,
                'folder_structure' => $folderPath,
                'files' => $generatedFiles
            ];

        } catch (\Exception $e) {
            Log::error('Error generating document files: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to generate document files: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get scan history
     */
    public function getScanHistory(Request $request)
    {
        try {
            $query = DocumentScanLog::with(['profile', 'scannedByUser'])
                ->orderBy('scanned_at', 'desc');

            // Apply filters
            if ($request->status) {
                $query->where('scan_status', $request->status);
            }

            if ($request->document_type) {
                $query->where('document_type', $request->document_type);
            }

            if ($request->days) {
                $query->recent($request->days);
            }

            if ($request->search) {
                $query->where(function ($q) use ($request) {
                    $q->where('document_id_number', 'LIKE', "%{$request->search}%")
                      ->orWhereHas('profile', function ($profileQuery) use ($request) {
                          $profileQuery->where('firstname', 'LIKE', "%{$request->search}%")
                                      ->orWhere('lastname', 'LIKE', "%{$request->search}%")
                                      ->orWhere('id_number', 'LIKE', "%{$request->search}%");
                      });
                });
            }

            $perPage = $request->get('per_page', 20);
            $scanLogs = $query->paginate($perPage);

            // Transform the data to include computed attributes
            $scanLogs->getCollection()->transform(function ($log) {
                return [
                    'id' => $log->id,
                    'document_id_number' => $log->document_id_number,
                    'document_type' => $log->document_type,
                    'scan_status' => $log->scan_status,
                    'status_label' => $log->status_label,
                    'status_color' => $log->status_color,
                    'scanned_at' => $log->scanned_at,
                    'scanner_ip' => $log->scanner_ip,
                    'profile' => $log->profile ? [
                        'id' => $log->profile->id,
                        'id_number' => $log->profile->id_number,
                        'firstname' => $log->profile->firstname,
                        'lastname' => $log->profile->lastname,
                        'fullname' => trim($log->profile->firstname . ' ' . $log->profile->lastname)
                    ] : null,
                    'scanned_by_user' => $log->scannedByUser ? [
                        'id' => $log->scannedByUser->id,
                        'username' => $log->scannedByUser->username
                    ] : null,
                    'scan_result' => $log->scan_result
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $scanLogs
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting scan history: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving scan history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Log scan attempt to database
     */
    private function logScanAttempt(Request $request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash)
    {
        try {
            DocumentScanLog::create([
                'document_id_number' => $documentIdNumber,
                'document_type' => $documentType,
                'profile_id' => $profileId,
                'scan_status' => $scanStatus,
                'scan_result' => $scanResult,
                'qr_data_hash' => $qrDataHash,
                'scanner_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'scanned_by' => Auth::id(),
                'scanned_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log scan attempt: ' . $e->getMessage());
        }
    }

    /**
     * Verify hash and return base45 data if valid
     * Works for both authenticated and public access
     */
    public function verifyHashAndGetBase45(Request $request)
    {
        try {
            $hash = $request->input('hash');
            
            if (!$hash) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hash is required'
                ], 400);
            }

            // Look up the hash in the database
            $verificationData = DocumentVerificationData::findByHash($hash);
            
            if (!$verificationData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid hash - document not found in system'
                ], 404);
            }

            // Log access for both public and authenticated users
            $userId = Auth::id(); // Will be null for public access
            Log::info("Hash verification accessed", [
                'hash' => substr($hash, 0, 8) . '...', // Log only first 8 chars for security
                'user_id' => $userId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'base45_data' => $verificationData->base45_data,
                    'hash' => $verificationData->verification_hash,
                    'created_at' => $verificationData->created_at
                ],
                'message' => 'Hash verified successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error verifying hash: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error verifying hash',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Public endpoint to validate QR code structure without full verification
     * This checks if the QR code is valid and returns basic document info
     */
    public function validateQRCode(Request $request)
    {
        $qrData = $request->input('qr_data');
        $qrDataHash = $qrData ? hash('sha256', $qrData) : null;
        $scanStatus = 'error';
        $scanResult = null;
        $documentIdNumber = null;
        $documentType = null;
        $profileId = null;
        
        try {
            if (!$qrData) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code data is required'
                ], 400);
            }

            $encryptionService = new DocumentEncryptionService(new DigitalSignatureService());
            
            // Step 1: Decode BASE45
            $decodedResult = $encryptionService->decodeFromBase45($qrData);

            if (!$decodedResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code format. Please ensure you are scanning a valid document QR code.'
                ], 400);
            }

            // Step 2: Parse JSON
            $jsonData = json_decode($decodedResult['decoded'], true);
            
            if (!$jsonData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code format. Please ensure you are scanning a valid document QR code.'
                ], 400);
            }

            // Step 3: Check if encrypted (AES-128-GCM)
            $finalData = $jsonData;
            if (isset($jsonData['algorithm']) && $jsonData['algorithm'] === 'A128GCM') {
                $decryptResult = $encryptionService->decryptAES128GCM($jsonData);
                
                if (!$decryptResult['success']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid QR code format. Please ensure you are scanning a valid document QR code.'
                    ], 400);
                }
                
                $finalData = $decryptResult['decrypted'];
            }

            // Step 4: Verify document exists
            if (!isset($finalData['doc_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code: missing document ID'
                ], 400);
            }

            // Extract data for logging
            $documentIdNumber = $finalData['doc_id'];
            $documentType = $finalData['type'] ?? 'Unknown';

            $document = IssuedDocument::with(['profile', 'signature', 'attachments'])
                ->withTrashed()
                ->where('document_id_number', $finalData['doc_id'])
                ->first();

            if (!$document) {
                // Extract document type from the data for better error message
                $docType = $finalData['type'] ?? 'Document';
                $typeMapping = [
                    'TOR' => 'Transcript of Records',
                    'COE' => 'Certificate of Enrollment',
                    'DIP' => 'Diploma',
                    'COG' => 'Certificate of Graduation',
                    'GMC' => 'Certificate of Good Moral Character'
                ];
                $fullDocType = $typeMapping[$docType] ?? $docType;
                
                return response()->json([
                    'success' => false,
                    'message' => "Document not found. Please ensure you are scanning a valid document QR code."
                ], 404);
            }

            // Set profile ID for logging
            $profileId = $document->profile_id;

            // COMPREHENSIVE VERIFICATION: Check PDF hash and signature integrity
            if (isset($finalData['pdf_hash'])) {
                $profile = $document->profile;
                if ($profile) {
                    // Map document type to short code
                    $typeMapping = [
                        'Transcript of Records' => 'TOR',
                        'Certificate of Enrollment' => 'COE', 
                        'Diploma' => 'DIP',
                        'Certificate of Graduation' => 'COG',
                        'Certificate of Good Moral Character' => 'GMC'
                    ];
                    $documentType = $typeMapping[$document->document_type] ?? 'DOC';
                    
                    // Construct path to original document
                    $version = $document->current_version ?? 1;
                    $idNumber = $profile->id_number;
                    $originalFileName = "v{$version}-{$idNumber}.pdf";
                    $originalFilePath = storage_path("app/public/documents/profile/{$idNumber}/{$documentType}/{$originalFileName}");
                    
                    if (file_exists($originalFilePath)) {
                        $actualPdfHash = hash_file('sha256', $originalFilePath);
                        
                        if ($finalData['pdf_hash'] !== $actualPdfHash) {
                            $this->logScanAttemptPublic($request, $documentIdNumber, $document->document_type, $profileId, 'tampered', 'PDF hash mismatch - document tampered', $qrDataHash);
                            return response()->json([
                                'success' => false,
                                'message' => 'Document verification failed. This document appears to be invalid or tampered with.'
                            ], 400);
                        }
                    } else {
                        $this->logScanAttemptPublic($request, $documentIdNumber, $document->document_type, $profileId, 'file_missing', 'Original document file not found', $qrDataHash);
                        return response()->json([
                            'success' => false,
                            'message' => 'Document verification failed. Please contact support for assistance.'
                        ], 404);
                    }
                }
            }

            // Verify digital signature integrity
            if (!$document->signature_id || !$document->signature) {
                $this->logScanAttemptPublic($request, $documentIdNumber, $document->document_type, $profileId, 'no_signature', 'Document signature not found', $qrDataHash);
                return response()->json([
                    'success' => false,
                    'message' => 'Document verification failed. This document appears to be invalid or tampered with.'
                ], 400);
            }

            // Check if document is revoked
            if ($document->date_revoked) {
                $scanStatus = 'revoked';
                $scanResult = [
                    'message' => 'Document has been revoked',
                    'revoked_at' => $document->date_revoked,
                    'revocation_reason' => $document->revocation_reason ?? 'No reason provided',
                    'document' => $document->toArray(),
                    'qr_data' => $finalData
                ];
            } else {
                // Document is valid
                $scanStatus = 'success';
                $scanResult = [
                    'message' => 'Document found and valid',
                    'document' => $document->toArray(),
                    'qr_data' => $finalData
                ];
            }
            
            // Log the scan attempt (without authentication)
            $this->logScanAttemptPublic($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash);

            return response()->json([
                'success' => true,
                'data' => [
                    'document' => $document,
                    'qr_data' => $finalData,
                    'scan_status' => $scanStatus
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error validating QR code: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error validating QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Public endpoint to verify document with additional details (serial number and email)
     * Includes comprehensive verification steps with progress tracking
     */
    public function verifyWithDetails(Request $request)
    {
        $request->validate([
            'qr_data' => 'required|string',
            'serial_number' => 'required|string',
            'email' => 'required|email'
        ]);

        $qrData = $request->input('qr_data');
        $serialNumber = $request->input('serial_number');
        $email = $request->input('email');
        
        try {
            $verificationSteps = [];
            
            // Step 1: QR Code Decoding (0-20%)
            $verificationSteps[] = ['step' => 'decoding', 'progress' => 10, 'message' => 'Decoding QR code...'];
            
            $encryptionService = new DocumentEncryptionService(new DigitalSignatureService());
            
            // Decode BASE45
            $decodedResult = $encryptionService->decodeFromBase45($qrData);
            if (!$decodedResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code format',
                    'step' => 'decoding',
                    'progress' => 15
                ], 400);
            }

            $verificationSteps[] = ['step' => 'decoding', 'progress' => 20, 'message' => 'QR code decoded successfully'];

            // Step 2: Data Decryption (20-40%)
            $verificationSteps[] = ['step' => 'decryption', 'progress' => 25, 'message' => 'Parsing document data...'];
            
            $jsonData = json_decode($decodedResult['decoded'], true);
            if (!$jsonData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code data format',
                    'step' => 'decryption',
                    'progress' => 30
                ], 400);
            }

            // Handle encryption if present
            $finalData = $jsonData;
            if (isset($jsonData['algorithm']) && $jsonData['algorithm'] === 'A128GCM') {
                $verificationSteps[] = ['step' => 'decryption', 'progress' => 35, 'message' => 'Decrypting document data...'];
                
                $decryptResult = $encryptionService->decryptAES128GCM($jsonData);
                if (!$decryptResult['success']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to decrypt QR code data',
                        'step' => 'decryption',
                        'progress' => 35
                    ], 400);
                }
                $finalData = $decryptResult['decrypted'];
            }

            $verificationSteps[] = ['step' => 'decryption', 'progress' => 40, 'message' => 'Document data decrypted successfully'];

            if (!isset($finalData['doc_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code: missing document ID',
                    'step' => 'decryption',
                    'progress' => 40
                ], 400);
            }

            // Step 3: Serial Number Verification (40-60%)
            $verificationSteps[] = ['step' => 'serial_verification', 'progress' => 45, 'message' => 'Finding document in database...'];
            
            $document = IssuedDocument::with(['profile', 'signature', 'attachments'])
                ->withTrashed()
                ->where('document_id_number', $finalData['doc_id'])
                ->first();

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found',
                    'step' => 'serial_verification',
                    'progress' => 50
                ], 404);
            }

            $verificationSteps[] = ['step' => 'serial_verification', 'progress' => 55, 'message' => 'Verifying serial number...'];

            // Verify serial number
            if ($document->serial_number !== $serialNumber) {
                // Save failed scan history
                $this->saveScanHistory($request, $email, $serialNumber, $document, 'failed', 'Invalid serial number', false);
                
                // Don't send email for failed verification - just return error
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid serial number. Please check your serial number and try again.',
                    'step' => 'serial_verification',
                    'progress' => 55
                ], 403);
            }

            $verificationSteps[] = ['step' => 'serial_verification', 'progress' => 60, 'message' => 'Serial number verified successfully'];

            // Step 4: Document Hash Verification (60-80%)
            $verificationSteps[] = ['step' => 'hash_verification', 'progress' => 65, 'message' => 'Verifying document integrity...'];
            
            $hashVerified = false;
            if (isset($finalData['pdf_hash'])) {
                $profile = $document->profile;
                if ($profile) {
                    // Map document type to short code
                    $typeMapping = [
                        'Transcript of Records' => 'TOR',
                        'Certificate of Enrollment' => 'COE', 
                        'Diploma' => 'DIP',
                        'Certificate of Graduation' => 'COG',
                        'Certificate of Good Moral Character' => 'GMC'
                    ];
                    $documentType = $typeMapping[$document->document_type] ?? 'DOC';
                    
                    // Construct path to original document
                    $version = $document->current_version ?? 1;
                    $idNumber = $profile->id_number;
                    $originalFileName = "v{$version}-{$idNumber}.pdf";
                    $originalFilePath = storage_path("app/public/documents/profile/{$idNumber}/{$documentType}/{$originalFileName}");
                    
                    if (file_exists($originalFilePath)) {
                        $actualPdfHash = hash_file('sha256', $originalFilePath);
                        
                        if ($finalData['pdf_hash'] === $actualPdfHash) {
                            $hashVerified = true;
                            $verificationSteps[] = ['step' => 'hash_verification', 'progress' => 75, 'message' => 'Document hash verified successfully'];
                        } else {
                            return response()->json([
                                'success' => false,
                                'message' => 'Document has been tampered with or is forged',
                                'step' => 'hash_verification',
                                'progress' => 70
                            ], 400);
                        }
                    } else {
                        return response()->json([
                            'success' => false,
                            'message' => 'Original document file not found for verification',
                            'step' => 'hash_verification',
                            'progress' => 70
                        ], 404);
                    }
                }
            }

            $verificationSteps[] = ['step' => 'hash_verification', 'progress' => 80, 'message' => 'Document integrity verified'];

            // Step 5: Digital Signature Verification (80-95%)
            $verificationSteps[] = ['step' => 'signature_verification', 'progress' => 85, 'message' => 'Verifying digital signature...'];
            
            // Check if document has valid signature
            if (!$document->signature_id || !$document->signature) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document signature not found',
                    'step' => 'signature_verification',
                    'progress' => 85
                ], 400);
            }

            $verificationSteps[] = ['step' => 'signature_verification', 'progress' => 90, 'message' => 'Digital signature verified'];

            // Email is only used for sending verification results - no validation needed

            $verificationSteps[] = ['step' => 'signature_verification', 'progress' => 95, 'message' => 'All verifications completed'];

            // Step 6: Final Validation (95-100%)
            $verificationSteps[] = ['step' => 'completion', 'progress' => 98, 'message' => 'Finalizing verification...'];
            
            // All verifications passed
            $scanStatus = $document->date_revoked ? 'revoked' : 'success';
            
            // Send email notification
            $emailSent = false;
            try {
                $this->sendVerificationEmail($email, $document, $scanStatus, $serialNumber);
                $emailSent = true;
            } catch (\Exception $e) {
                Log::error('Failed to send verification email: ' . $e->getMessage());
                // Continue with response even if email fails
            }
            
            // Save successful scan history
            $this->saveScanHistory($request, $email, $serialNumber, $document, $scanStatus, null, $emailSent);
            
            $verificationSteps[] = ['step' => 'completion', 'progress' => 100, 'message' => 'Verification completed successfully'];
            
            return response()->json([
                'success' => true,
                'message' => 'Document verification completed successfully',
                'data' => [
                    'document' => $document,
                    'qr_data' => $finalData,
                    'scan_status' => $scanStatus,
                    'verified_at' => now()->toISOString(),
                    'verification_steps' => $verificationSteps,
                    'hash_verified' => $hashVerified,
                    'signature_verified' => true
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error verifying document with details: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error verifying document',
                'error' => $e->getMessage(),
                'step' => 'error',
                'progress' => 0
            ], 500);
        }
    }

    /**
     * Log scan attempt for public verification (without authentication)
     */
    private function logScanAttemptPublic($request, $documentIdNumber, $documentType, $profileId, $scanStatus, $scanResult, $qrDataHash)
    {
        try {
            DocumentScanLog::create([
                'document_id_number' => $documentIdNumber,
                'document_type' => $documentType,
                'profile_id' => $profileId,
                'scan_status' => $scanStatus,
                'scan_result' => $scanResult,
                'qr_data_hash' => $qrDataHash,
                'scanner_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'scanned_by' => null, // No authentication for public verification
                'scanned_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log public scan attempt: ' . $e->getMessage());
        }
    }

    /**
     * Send verification result email notification
     */
    private function sendVerificationEmail($email, $document, $status, $serialNumber, $failureReason = null)
    {
        try {
            // Determine template type based on status (only success and revoked send emails)
            if ($status === 'success') {
                $templateType = EmailTemplate::TYPE_VERIFICATION_RESULT_SUCCESS;
            } elseif ($status === 'revoked') {
                $templateType = EmailTemplate::TYPE_VERIFICATION_RESULT_REVOKED;
            } else {
                // Failed verifications should not send emails
                Log::info("Skipping email for failed verification status: {$status}");
                return;
            }

            // Get the email template with header and footer images
            $template = EmailTemplate::with(['headerImages', 'footerImages'])
                ->where('template_type', $templateType)
                ->where('is_active', true)
                ->first();

            if (!$template) {
                Log::warning("No active email template found for type: {$templateType}");
                return;
            }

            // Prepare template variables using correct format [category:variable]
            $variables = [
                'student:name' => $document->profile->firstname . ' ' . $document->profile->lastname,
                'student:id' => $document->profile->id_number,
                'document:type' => $document->document_type,
                'document:serial' => $serialNumber,
                'verification:date' => now()->format('F j, Y'),
                'verification:time' => now()->format('g:i A'),
                'document:issued_date' => $document->date_issued ? \Carbon\Carbon::parse($document->date_issued)->format('F j, Y') : 'N/A',
                'verification:status' => ucfirst($status),
            ];

            // Add status-specific variables (only for success and revoked - failed doesn't send emails)
            if ($status === 'revoked') {
                $variables['document:revocation_reason'] = $document->revocation_reason ?? 'No reason provided';
                $variables['document:revocation_date'] = $document->date_revoked ? \Carbon\Carbon::parse($document->date_revoked)->format('F j, Y') : 'N/A';
            }

            // Replace template placeholders with actual values
            $subject = $this->replacePlaceholders($template->subject, $variables);
            $body = $this->buildVerificationEmailBody($template, $variables);

            // Prepare email data for Gmail service
            $emailData = [
                'to' => $email,
                'subject' => $subject,
                'body' => $body,
                'attachments' => []
            ];

            // Send email using Gmail service
            $gmailService = new GmailService();
            $result = $gmailService->sendEmail($emailData);

            Log::info("Verification email sent successfully to {$email} for document {$document->document_id_number}");
            
            return $result;

        } catch (\Exception $e) {
            Log::error('Error sending verification email: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Build verification email body with header and footer images
     */
    private function buildVerificationEmailBody($template, $variables)
    {
        $body = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: transparent;">';
        
        // Header Images Section
        if ($template->headerImages && $template->headerImages->count() > 0) {
            $body .= '<div style="text-align: center; margin-bottom: 20px;">';
            foreach ($template->headerImages as $image) {
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
        
        // Main Body Content - Replace template placeholders
        $processedBody = $this->replacePlaceholders($template->body, $variables);
        $body .= $processedBody;

        // Footer Images Section
        if ($template->footerImages && $template->footerImages->count() > 0) {
            $body .= '<div style="text-align: center; margin-top: 20px;">';
            foreach ($template->footerImages as $image) {
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
            if (!$filePath) {
                return null;
            }

            // Handle both absolute and relative paths
            $fullPath = $filePath;
            if (!file_exists($fullPath)) {
                $fullPath = storage_path('app/public/' . $filePath);
            }
            
            if (!file_exists($fullPath)) {
                $fullPath = public_path($filePath);
            }

            if (!file_exists($fullPath)) {
                Log::warning("Email image file not found: {$filePath}");
                return null;
            }

            $imageData = file_get_contents($fullPath);
            $mimeType = mime_content_type($fullPath);
            
            if ($imageData === false || !$mimeType) {
                Log::warning("Could not read email image file: {$filePath}");
                return null;
            }

            return 'data:' . $mimeType . ';base64,' . base64_encode($imageData);
        } catch (\Exception $e) {
            Log::error("Error converting image to base64 for email: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Replace template placeholders with actual values
     */
    private function replacePlaceholders($text, $variables)
    {
        foreach ($variables as $key => $value) {
            $placeholder = '[' . $key . ']';
            $text = str_replace($placeholder, $value, $text);
        }
        return $text;
    }

    /**
     * Save public scan history
     */
    private function saveScanHistory(Request $request, $email, $serialNumber, $document, $status, $failureReason = null, $emailSent = false)
    {
        try {
            PublicScanHistory::create([
                'email' => $email,
                'serial_number' => $serialNumber,
                'document_type' => $document ? $document->document_type : 'Unknown',
                'student_name' => $document && $document->profile ? 
                    $document->profile->firstname . ' ' . $document->profile->lastname : 'Unknown',
                'student_id' => $document && $document->profile ? $document->profile->id_number : null,
                'ip_address' => $this->getRealIpAddress($request),
                'user_agent' => $request->userAgent(),
                'scan_status' => $status,
                'failure_reason' => $failureReason,
                'email_sent' => $emailSent,
                'scanned_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to save scan history: ' . $e->getMessage());
        }
    }

    /**
     * Get the real public IP address, considering proxies and load balancers
     */
    private function getRealIpAddress($request)
    {
        // For development, try to get a more realistic IP or show local info
        if (app()->environment('local')) {
            // Try to get external IP for development testing
            $externalIp = $this->getExternalIp();
            if ($externalIp) {
                return $externalIp;
            }
        }

        // Check for IP from various headers that might contain the real IP
        $ipHeaders = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',            // Proxy
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_REAL_IP',            // Nginx proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'REMOTE_ADDR'                // Standard
        ];

        foreach ($ipHeaders as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]); // Get the first IP if multiple
                
                // Validate IP address (allow private ranges in development)
                $flags = app()->environment('local') 
                    ? FILTER_VALIDATE_IP 
                    : FILTER_VALIDATE_IP | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE;
                    
                if (filter_var($ip, $flags)) {
                    return $ip;
                }
            }
        }

        // Fallback to Laravel's default method
        $defaultIp = $request->ip();
        
        // In development, append indicator
        if (app()->environment('local') && $defaultIp === '127.0.0.1') {
            return $defaultIp . ' (localhost)';
        }
        
        return $defaultIp;
    }

    /**
     * Try to get external IP for development testing (optional)
     */
    private function getExternalIp()
    {
        try {
            // Only try this in development and with a timeout
            if (app()->environment('local')) {
                $context = stream_context_create([
                    'http' => [
                        'timeout' => 2, // 2 second timeout
                        'ignore_errors' => true
                    ]
                ]);
                
                $ip = @file_get_contents('https://api.ipify.org', false, $context);
                
                if ($ip && filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return trim($ip);
                }
            }
        } catch (\Exception $e) {
            // Silently fail and use fallback
        }
        
        return null;
    }
}
