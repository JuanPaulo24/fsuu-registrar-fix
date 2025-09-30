<?php

namespace App\Jobs;

use App\Events\EmailReceived;
use App\Services\GmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CheckNewEmails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;

    /**
     * Create a new job instance.
     */
    public function __construct($userId = 1)
    {
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(GmailService $gmailService): void
    {
        if (!$gmailService->isReady()) {
            return;
        }

        // Check if real-time WebSocket is active - if so, skip broadcasting but still check for auto-replies
        $realtimeActive = Cache::get("realtime_email_active_user_{$this->userId}", false);
        $skipBroadcasting = $realtimeActive;
        
        if ($skipBroadcasting) {
            Log::info("CheckNewEmails: Real-time WebSocket is active for user {$this->userId} - will check for auto-replies only");
        }

        try {
            // Get the latest emails from inbox
            Log::info("🤖 CheckNewEmails: Fetching inbox emails for user {$this->userId}");
            $latestEmails = $gmailService->getInboxEmails(10);
            
            Log::info("🤖 CheckNewEmails: Retrieved " . count($latestEmails) . " emails from Gmail");
            
            if (empty($latestEmails)) {
                Log::info("🤖 CheckNewEmails: No emails retrieved from Gmail");
                return;
            }

            // Cache key for storing last checked email IDs
            $cacheKey = "gmail_last_checked_emails_user_{$this->userId}";
            
            // Get previously checked email IDs from cache
            $lastCheckedIds = Cache::get($cacheKey, []);
            Log::info("🤖 CheckNewEmails: Previously checked " . count($lastCheckedIds) . " email IDs");
            
            // Find new emails
            $newEmails = array_filter($latestEmails, function ($email) use ($lastCheckedIds) {
                return !in_array($email['id'], $lastCheckedIds);
            });
            
            Log::info("🤖 CheckNewEmails: Found " . count($newEmails) . " new emails");
            
            if (!empty($newEmails)) {
                // Process each new email
                foreach ($newEmails as $email) {
                    Log::info("🤖 CheckNewEmails: Processing email ID: {$email['id']}, Subject: {$email['subject']}, To: " . ($email['toEmail'] ?? $email['to'] ?? 'unknown'));
                    
                    // Only broadcast if real-time is not active (to avoid duplicate notifications)
                    if (!$skipBroadcasting) {
                        event(new EmailReceived($email, 'inbox', $this->userId));
                    }
                    
                    // Always check for auto-reply regardless of real-time status
                    $this->checkForAutoReply($email);
                }
                
                // Update cache with all current email IDs
                $currentIds = array_column($latestEmails, 'id');
                Cache::put($cacheKey, $currentIds, now()->addDays(1));
                Log::info("🤖 CheckNewEmails: Updated cache with " . count($currentIds) . " email IDs");
            } else {
                Log::info("🤖 CheckNewEmails: No new emails found");
            }

        } catch (\Exception $e) {
            throw $e; // Re-throw to mark job as failed
        }
    }

    /**
     * Check if incoming email should trigger an auto-reply
     */
    private function checkForAutoReply($email)
    {
        try {
            Log::info("🤖 checkForAutoReply: Checking email ID: {$email['id']}");
            
            // Check if auto-reply is enabled
            if (!config('auto_reply.enabled', true)) {
                Log::info("🤖 checkForAutoReply: Auto-reply is disabled in config");
                return;
            }

            // Get the email address that should trigger auto-replies
            $autoReplyEmailAddress = config('auto_reply.email_address', 'jburgers728@gmail.com');
            Log::info("🤖 checkForAutoReply: Auto-reply address: {$autoReplyEmailAddress}");
            
            // Check if this email was sent TO our auto-reply address
            $recipientEmail = $email['toEmail'] ?? $email['to'] ?? '';
            Log::info("🤖 checkForAutoReply: Raw recipient: {$recipientEmail}");
            
            // Extract email address from recipient field (in case it contains name)
            if (preg_match('/<(.+)>/', $recipientEmail, $matches)) {
                $recipientEmail = $matches[1];
            }
            
            Log::info("🤖 checkForAutoReply: Cleaned recipient: {$recipientEmail}");
            
            // Only process auto-reply if the email was sent to our designated address
            if (strtolower(trim($recipientEmail)) === strtolower($autoReplyEmailAddress)) {
                Log::info("🤖 checkForAutoReply: ✅ Email matches auto-reply address!");
                
                // Don't auto-reply to our own emails or system emails
                $senderEmail = $email['fromEmail'] ?? $email['from'] ?? '';
                if (preg_match('/<(.+)>/', $senderEmail, $matches)) {
                    $senderEmail = $matches[1];
                }
                
                // Skip if sender is our own email or common system emails
                $skipSenders = array_merge(
                    [$autoReplyEmailAddress],
                    config('auto_reply.skip_senders', [])
                );
                
                $shouldSkip = false;
                foreach ($skipSenders as $skipPattern) {
                    if (stripos($senderEmail, $skipPattern) !== false) {
                        $shouldSkip = true;
                        break;
                    }
                }
                
                if (!$shouldSkip && !empty($senderEmail)) {
                    Log::info("📧 Triggering auto-reply for email from: {$senderEmail} to: {$recipientEmail}");
                    
                    // Dispatch auto-reply job with configurable delay to ensure email is fully processed
                    $delaySeconds = config('auto_reply.job_delay_seconds', 10);
                    ProcessAutoReply::dispatch($email, $this->userId)->delay(now()->addSeconds($delaySeconds));
                } else {
                    Log::info("📧 Skipping auto-reply for system/own email: {$senderEmail}");
                }
            } else {
                Log::info("🤖 checkForAutoReply: ❌ Email not addressed to auto-reply address. Recipient: {$recipientEmail}, Auto-reply address: {$autoReplyEmailAddress}");
            }
            
        } catch (\Exception $e) {
            Log::error('📧 Error checking for auto-reply: ' . $e->getMessage(), [
                'email_id' => $email['id'] ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            // Don't throw - we don't want auto-reply errors to fail the main email check job
        }
    }
}