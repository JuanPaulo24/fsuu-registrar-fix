<?php

namespace App\Http\Controllers;

use App\Services\GmailService;
use App\Traits\ChecksPermissions;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GmailController extends Controller
{
    use ChecksPermissions;
    
    protected $gmailService;

    public function __construct(GmailService $gmailService)
    {
        $this->gmailService = $gmailService;
    }

    /**
     * Get new emails since last fetch (incremental update)
     */
    public function getNewEmails(Request $request): JsonResponse
    {
        try {
            \Log::info('GmailController: getNewEmails called with params: ' . json_encode($request->all()));
            
            if (!$this->gmailService->isReady()) {
                \Log::error('GmailController: GmailService not ready for incremental fetch');
                return response()->json([
                    'success' => false,
                    'message' => 'Gmail service is not initialized. Check credentials and tokens.'
                ], 500);
            }

            $folder = $request->get('folder', 'inbox');
            $lastFetchTime = $request->get('last_fetch_time'); // ISO timestamp
            $maxResults = $request->get('max_results', 10);

            // If no last fetch time provided, fall back to regular fetch
            if (!$lastFetchTime) {
                \Log::info('GmailController: No last_fetch_time provided, falling back to regular fetch');
                return $this->getInbox($request);
            }

            \Log::info('GmailController: Fetching new emails for folder: ' . $folder . ' since: ' . $lastFetchTime);
            
            // Convert to Gmail query format
            $dateQuery = 'after:' . date('Y/m/d', strtotime($lastFetchTime));
            
            $emails = [];
            
            switch ($folder) {
                case 'inbox':
                    $emails = $this->gmailService->getInboxEmails($maxResults, $dateQuery);
                    break;
                case 'sent':
                    $emails = $this->gmailService->getSentEmails($maxResults, $dateQuery);
                    break;
                case 'draft':
                    $emails = $this->gmailService->getDraftEmails($maxResults);
                    break;
                case 'archive':
                    $emails = $this->gmailService->getArchiveEmails($maxResults, $dateQuery);
                    break;
                case 'spam':
                    $emails = $this->gmailService->getSpamEmails($maxResults, $dateQuery);
                    break;
                default:
                    $emails = $this->gmailService->getInboxEmails($maxResults, $dateQuery);
            }

            // Filter emails to only include those newer than last fetch time
            $lastFetchTimestamp = strtotime($lastFetchTime);
            $newEmails = array_filter($emails, function($email) use ($lastFetchTimestamp) {
                $emailTimestamp = strtotime($email['date']);
                return $emailTimestamp > $lastFetchTimestamp;
            });

            \Log::info('GmailController: Found ' . count($newEmails) . ' new emails');

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $newEmails,
                    'folder' => $folder,
                    'new_count' => count($newEmails),
                    'fetch_time' => now()->toISOString()
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('GmailController: Error in getNewEmails: ' . $e->getMessage());
            \Log::error('GmailController: Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve new emails: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inbox emails
     */
    public function getInbox(Request $request): JsonResponse
    {
        try {
            \Log::info('GmailController: getInbox called with params: ' . json_encode($request->all()));
            
            if (!$this->gmailService->isReady()) {
                \Log::error('GmailController: GmailService not ready (initialization failed)');
                return response()->json([
                    'success' => false,
                    'message' => 'Gmail service is not initialized. Check credentials and tokens.'
                ], 500);
            }

            $page = $request->get('page', 1);
            $pageSize = $request->get('page_size', 10);
            $maxResults = $request->get('max_results', 50);

            \Log::info('GmailController: Calling GmailService->getInboxEmails with maxResults: ' . $maxResults);
            $emails = $this->gmailService->getInboxEmails($maxResults);
            // Ensure UTF-8 safe JSON payload
            array_walk($emails, function (&$row) {
                if (is_array($row)) {
                    foreach ($row as $k => $v) {
                        if (is_string($v)) {
                            $row[$k] = mb_convert_encoding($v, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252');
                        }
                    }
                }
            });
            
            \Log::info('GmailController: Received ' . count($emails) . ' emails from GmailService');
            
            // Apply pagination
            $total = count($emails);
            $offset = ($page - 1) * $pageSize;
            $paginatedEmails = array_slice($emails, $offset, $pageSize);

            \Log::info('GmailController: Returning ' . count($paginatedEmails) . ' paginated emails');

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $paginatedEmails,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $pageSize,
                        'total' => $total,
                        'last_page' => ceil($total / $pageSize)
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('GmailController: Error in getInbox: ' . $e->getMessage());
            \Log::error('GmailController: Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve inbox emails: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sent emails
     */
    public function getSent(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $pageSize = $request->get('page_size', 10);
            $maxResults = $request->get('max_results', 50);

            $emails = $this->gmailService->getSentEmails($maxResults);
            
            // Apply pagination
            $total = count($emails);
            $offset = ($page - 1) * $pageSize;
            $paginatedEmails = array_slice($emails, $offset, $pageSize);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $paginatedEmails,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $pageSize,
                        'total' => $total,
                        'last_page' => ceil($total / $pageSize)
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve sent emails: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get draft emails
     */
    public function getDrafts(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $pageSize = $request->get('page_size', 10);
            $maxResults = $request->get('max_results', 50);

            $emails = $this->gmailService->getDraftEmails($maxResults);
            
            // Apply pagination
            $total = count($emails);
            $offset = ($page - 1) * $pageSize;
            $paginatedEmails = array_slice($emails, $offset, $pageSize);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $paginatedEmails,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $pageSize,
                        'total' => $total,
                        'last_page' => ceil($total / $pageSize)
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve draft emails: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archive emails
     */
    public function getArchive(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $pageSize = $request->get('page_size', 10);
            $maxResults = $request->get('max_results', 50);

            $emails = $this->gmailService->getArchiveEmails($maxResults);
            
            // Apply pagination
            $total = count($emails);
            $offset = ($page - 1) * $pageSize;
            $paginatedEmails = array_slice($emails, $offset, $pageSize);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $paginatedEmails,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $pageSize,
                        'total' => $total,
                        'last_page' => ceil($total / $pageSize)
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve archive emails: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get deleted emails
     */
    public function getDeleted(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $pageSize = $request->get('page_size', 10);
            $maxResults = $request->get('max_results', 50);

            $emails = $this->gmailService->getDeletedEmails($maxResults);
            
            // Apply pagination
            $total = count($emails);
            $offset = ($page - 1) * $pageSize;
            $paginatedEmails = array_slice($emails, $offset, $pageSize);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $paginatedEmails,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $pageSize,
                        'total' => $total,
                        'last_page' => ceil($total / $pageSize)
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve deleted emails: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get spam emails
     */
    public function getSpam(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $pageSize = $request->get('page_size', 10);
            $maxResults = $request->get('max_results', 50);

            $emails = $this->gmailService->getSpamEmails($maxResults);
            
            // Apply pagination
            $total = count($emails);
            $offset = ($page - 1) * $pageSize;
            $paginatedEmails = array_slice($emails, $offset, $pageSize);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $paginatedEmails,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $pageSize,
                        'total' => $total,
                        'last_page' => ceil($total / $pageSize)
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve spam emails: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send email via Gmail
     */
    public function sendEmail(Request $request): JsonResponse
    {
        // Authorization check for email composition
        if ($response = $this->authorizeOrFail(['M-04-COMPOSE'], "Unauthorized: You don't have permission to compose emails.")) {
            return $response;
        }

        try {
            if (!$this->gmailService->isReady()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gmail service is not initialized. Check credentials and tokens.'
                ], 500);
            }

            $request->validate([
                'to' => 'required|string',
                'subject' => 'required|string',
                'body' => 'required|string',
                'cc' => 'nullable|string',
                'bcc' => 'nullable|string',
                'attachments' => 'nullable|array',
                'attachments.*.filename' => 'required_with:attachments|string',
                'attachments.*.content' => 'required_with:attachments|string',
                'attachments.*.contentType' => 'required_with:attachments|string',
            ]);

            // Validate email addresses in the comma-separated strings
            $this->validateEmails($request->to, 'to');
            if ($request->cc) {
                $this->validateEmails($request->cc, 'cc');
            }
            if ($request->bcc) {
                $this->validateEmails($request->bcc, 'bcc');
            }

            $attachments = $request->attachments ?? [];

            $result = $this->gmailService->sendEmail([
                'to' => $request->to,
                'cc' => $request->cc,
                'bcc' => $request->bcc,
                'subject' => $request->subject,
                'body' => $request->body,
                'attachments' => $attachments,
            ]);

            // Trigger real-time notification for sent email
            $userId = $request->user()->id ?? 1;
            event(new \App\Events\EmailSent([
                'user_id' => $userId,
                'email_data' => [
                    'to' => $request->to,
                    'subject' => $request->subject,
                    'id' => $result['id'],
                    'threadId' => $result['threadId']
                ],
                'timestamp' => now()
            ]));

            // Also trigger a delayed job as backup
            \App\Jobs\CheckSentEmails::dispatch($userId)->delay(now()->addSeconds(5));

            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save email as draft
     */
    public function saveDraft(Request $request): JsonResponse
    {
        try {
            if (!$this->gmailService->isReady()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gmail service is not initialized. Check credentials and tokens.'
                ], 500);
            }

            $request->validate([
                'to' => 'nullable|string',
                'subject' => 'nullable|string',
                'body' => 'nullable|string',
                'cc' => 'nullable|string',
                'bcc' => 'nullable|string',
                'attachments' => 'nullable|array',
                'attachments.*.filename' => 'required_with:attachments|string',
                'attachments.*.content' => 'required_with:attachments|string',
                'attachments.*.contentType' => 'required_with:attachments|string',
                'isDraft' => 'nullable|boolean',
            ]);

            // Validate email addresses in the comma-separated strings (only if not empty)
            if ($request->to) {
                $this->validateEmails($request->to, 'to');
            }
            if ($request->cc) {
                $this->validateEmails($request->cc, 'cc');
            }
            if ($request->bcc) {
                $this->validateEmails($request->bcc, 'bcc');
            }

            $result = $this->gmailService->saveDraft([
                'to' => $request->to,
                'cc' => $request->cc,
                'bcc' => $request->bcc,
                'subject' => $request->subject,
                'body' => $request->body,
                'attachments' => $request->attachments ?? [],
            ]);

            // Trigger real-time notification for saved draft
            $userId = $request->user()->id ?? 1;
            event(new \App\Events\DraftSaved([
                'user_id' => $userId,
                'draft_data' => [
                    'to' => $request->to,
                    'subject' => $request->subject,
                    'id' => $result['id']
                ],
                'timestamp' => now()
            ]));

            // Also trigger a delayed job as backup
            \App\Jobs\CheckDraftEmails::dispatch($userId)->delay(now()->addSeconds(3));

            return response()->json([
                'success' => true,
                'message' => 'Draft saved successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save draft: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark email as spam
     */
    public function markAsSpam(Request $request, $messageId): JsonResponse
    {
        // Authorization check for marking spam
        if ($response = $this->authorizeOrFail(['M-04-SPAM'], "Unauthorized: You don't have permission to mark emails as spam.")) {
            return $response;
        }

        try {
            \Log::info('GmailController: markAsSpam called for messageId: ' . $messageId);
            
            if (!$this->gmailService->isReady()) {
                \Log::error('GmailController: GmailService not ready for marking email as spam');
                return response()->json([
                    'success' => false,
                    'message' => 'Gmail service is not initialized. Check credentials and tokens.'
                ], 500);
            }

            $result = $this->gmailService->markAsSpam($messageId);

            \Log::info('GmailController: Email marked as spam successfully');

            return response()->json([
                'success' => true,
                'message' => 'Email marked as spam successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            \Log::error('GmailController: Error in markAsSpam: ' . $e->getMessage());
            \Log::error('GmailController: Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark email as spam: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Trigger email monitoring for testing (dispatch check emails job)
     */
    public function triggerMonitoring(Request $request): JsonResponse
    {
        try {
            if (!$this->gmailService->isReady()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gmail service is not initialized. Check credentials and tokens.'
                ], 500);
            }

            $userId = $request->user()->id ?? 1;
            
            // Dispatch the check emails job
            \App\Jobs\CheckNewEmails::dispatch($userId);
            
            return response()->json([
                'success' => true,
                'message' => 'Email monitoring job dispatched successfully. Check for new emails in a moment.',
                'user_id' => $userId
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to trigger email monitoring: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Report email as not spam
     */
    public function reportNotSpam(Request $request, $messageId): JsonResponse
    {
        try {
            \Log::info('GmailController: reportNotSpam called for messageId: ' . $messageId);
            
            if (!$this->gmailService->isReady()) {
                \Log::error('GmailController: GmailService not ready for reporting email as not spam');
                return response()->json([
                    'success' => false,
                    'message' => 'Gmail service is not initialized. Check credentials and tokens.'
                ], 500);
            }

            $result = $this->gmailService->reportNotSpam($messageId);

            \Log::info('GmailController: Email reported as not spam successfully');

            return response()->json([
                'success' => true,
                'message' => 'Email reported as not spam successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            \Log::error('GmailController: Error in reportNotSpam: ' . $e->getMessage());
            \Log::error('GmailController: Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to report email as not spam: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Archive email
     */
    public function archiveEmail(Request $request, $messageId): JsonResponse
    {
        try {
            \Log::info('GmailController: archiveEmail called for messageId: ' . $messageId);
            
            if (!$this->gmailService->isReady()) {
                \Log::error('GmailController: GmailService not ready for archiving email');
                return response()->json([
                    'success' => false,
                    'message' => 'Gmail service is not initialized. Check credentials and tokens.'
                ], 500);
            }

            $result = $this->gmailService->archiveEmail($messageId);

            \Log::info('GmailController: Email archived successfully');

            return response()->json([
                'success' => true,
                'message' => 'Email archived successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            \Log::error('GmailController: Error in archiveEmail: ' . $e->getMessage());
            \Log::error('GmailController: Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete email
     */
public function deleteEmail(Request $request, $messageId): JsonResponse
    {
        try {
            \Log::info('GmailController: deleteEmail called for messageId: ' . $messageId);
            
            if (!$this->gmailService->isReady()) {
                \Log::error('GmailController: GmailService not ready for deleting email');
                return response()->json([
                    'success' => false,
                    'message' => 'Gmail service is not initialized. Check credentials and tokens.'
                ], 500);
            }

            $result = $this->gmailService->deleteEmail($messageId);

            \Log::info('GmailController: Email deleted successfully');

            return response()->json([
                'success' => true,
                'message' => 'Email deleted successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            \Log::error('GmailController: Error in deleteEmail: ' . $e->getMessage());
            \Log::error('GmailController: Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download email attachment
     */
    public function downloadAttachment(Request $request, $messageId, $attachmentId): JsonResponse
    {
        try {
            \Log::info('GmailController: downloadAttachment called for messageId: ' . $messageId . ', attachmentId: ' . $attachmentId);
            
            if (!$this->gmailService->isReady()) {
                \Log::error('GmailController: GmailService not ready for attachment download');
                return response()->json([
                    'success' => false,
                    'message' => 'Gmail service is not initialized. Check credentials and tokens.'
                ], 500);
            }

            $filename = $request->get('filename', 'attachment');
            $mimeType = $request->get('mimeType', 'application/octet-stream');
            
            \Log::info('GmailController: Getting attachment data from GmailService');
            $attachmentData = $this->gmailService->getAttachmentDataUrl($messageId, $attachmentId);
            
            \Log::info('GmailController: Successfully retrieved attachment data');

            return response()->json([
                'success' => true,
                'data' => [
                    'filename' => $filename,
                    'mimeType' => $mimeType,
                    'data' => $attachmentData
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('GmailController: Error in downloadAttachment: ' . $e->getMessage());
            \Log::error('GmailController: Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to download attachment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set real-time WebSocket status to control queue job execution
     */
    public function setRealtimeStatus(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'active' => 'required|boolean',
                'userId' => 'required|integer'
            ]);

            $userId = $request->userId;
            $active = $request->active;

            // Set cache flag with 15-minute expiration (will be renewed by active connections)
            $cacheKey = "realtime_email_active_user_{$userId}";
            
            if ($active) {
                \Cache::put($cacheKey, true, now()->addMinutes(15));
                \Log::info("Real-time email status set to ACTIVE for user {$userId}");
            } else {
                \Cache::forget($cacheKey);
                \Log::info("Real-time email status set to INACTIVE for user {$userId}");
            }

            return response()->json([
                'success' => true,
                'message' => 'Real-time status updated successfully',
                'active' => $active,
                'userId' => $userId
            ]);

        } catch (\Exception $e) {
            \Log::error('Error setting realtime status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to set realtime status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate comma-separated email addresses
     */
    private function validateEmails($emailString, $fieldName)
    {
        if (empty($emailString)) {
            return;
        }

        $emails = array_map('trim', explode(',', $emailString));
        $invalidEmails = [];

        foreach ($emails as $email) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $invalidEmails[] = $email;
            }
        }

        if (!empty($invalidEmails)) {
            throw new \Illuminate\Validation\ValidationException(
                validator([], []),
                [
                    $fieldName => ["Invalid email addresses in {$fieldName}: " . implode(', ', $invalidEmails)]
                ]
            );
        }
    }
}