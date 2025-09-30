<?php

namespace App\Console\Commands;

use App\Services\GmailService;
use App\Jobs\ProcessAutoReply;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TestAutoReplyDirect extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auto-reply:test-direct {--user-id=1}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Directly test auto-reply logic without using queue jobs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');
        
        $this->info("🤖 Testing Auto-Reply Logic Directly");
        $this->info("===================================\n");

        // Test Gmail service
        $gmailService = app(GmailService::class);

        if (!$gmailService->isReady()) {
            $this->error("❌ Gmail service is not ready");
            return 1;
        }

        $this->info("✅ Gmail service is ready");

        // Get the latest emails from inbox
        $this->info("📧 Fetching inbox emails...");
        $latestEmails = $gmailService->getInboxEmails(10);
        
        $this->info("📧 Retrieved " . count($latestEmails) . " emails from Gmail");
        
        if (empty($latestEmails)) {
            $this->error("❌ No emails retrieved from Gmail");
            return 1;
        }

        // Cache key for storing last checked email IDs
        $cacheKey = "gmail_last_checked_emails_user_{$userId}";
        
        // Get previously checked email IDs from cache
        $lastCheckedIds = Cache::get($cacheKey, []);
        $this->info("📧 Previously checked " . count($lastCheckedIds) . " email IDs");
        
        // Find new emails
        $newEmails = array_filter($latestEmails, function ($email) use ($lastCheckedIds) {
            return !in_array($email['id'], $lastCheckedIds);
        });
        
        $this->info("📧 Found " . count($newEmails) . " new emails");
        
        if (!empty($newEmails)) {
            // Process each new email
            foreach ($newEmails as $email) {
                $this->info("\n📧 Processing email ID: {$email['id']}");
                $this->info("   Subject: {$email['subject']}");
                $this->info("   To: " . ($email['toEmail'] ?? $email['to'] ?? 'unknown'));
                $this->info("   From: " . ($email['fromEmail'] ?? $email['from'] ?? 'unknown'));
                
                // Test auto-reply logic
                $this->checkForAutoReply($email, $userId);
            }
            
            // Update cache with all current email IDs
            $currentIds = array_column($latestEmails, 'id');
            Cache::put($cacheKey, $currentIds, now()->addDays(1));
            $this->info("\n📧 Updated cache with " . count($currentIds) . " email IDs");
        } else {
            $this->info("📧 No new emails found");
        }

        return 0;
    }

    /**
     * Check if incoming email should trigger an auto-reply
     */
    private function checkForAutoReply($email, $userId)
    {
        try {
            $this->info("🤖 Checking auto-reply for email ID: {$email['id']}");
            
            // Check if auto-reply is enabled
            if (!config('auto_reply.enabled', true)) {
                $this->info("❌ Auto-reply is disabled in config");
                return;
            }

            // Get the email address that should trigger auto-replies
            $autoReplyEmailAddress = config('auto_reply.email_address', 'jburgers728@gmail.com');
            $this->info("🎯 Auto-reply address: {$autoReplyEmailAddress}");
            
            // Check if this email was sent TO our auto-reply address
            $recipientEmail = $email['toEmail'] ?? $email['to'] ?? '';
            $this->info("📧 Raw recipient: {$recipientEmail}");
            
            // Extract email address from recipient field (in case it contains name)
            if (preg_match('/<(.+)>/', $recipientEmail, $matches)) {
                $recipientEmail = $matches[1];
            }
            
            $this->info("📧 Cleaned recipient: {$recipientEmail}");
            
            // Only process auto-reply if the email was sent to our designated address
            if (strtolower(trim($recipientEmail)) === strtolower($autoReplyEmailAddress)) {
                $this->info("✅ Email matches auto-reply address!");
                
                // Don't auto-reply to our own emails or system emails
                $senderEmail = $email['fromEmail'] ?? $email['from'] ?? '';
                if (preg_match('/<(.+)>/', $senderEmail, $matches)) {
                    $senderEmail = $matches[1];
                }
                
                $this->info("📧 Sender email: {$senderEmail}");
                
                // Skip if sender is our own email or common system emails
                $skipSenders = array_merge(
                    [$autoReplyEmailAddress],
                    config('auto_reply.skip_senders', [])
                );
                
                $shouldSkip = false;
                foreach ($skipSenders as $skipPattern) {
                    if (stripos($senderEmail, $skipPattern) !== false) {
                        $shouldSkip = true;
                        $this->info("❌ Skipping - matches skip pattern: {$skipPattern}");
                        break;
                    }
                }
                
                if (!$shouldSkip && !empty($senderEmail)) {
                    $this->info("🚀 TRIGGERING AUTO-REPLY!");
                    $this->info("   From: {$senderEmail}");
                    $this->info("   To: {$recipientEmail}");
                    
                    // Check rate limiting
                    $rateLimitKey = "auto_reply_sent_to_" . md5($senderEmail);
                    $rateLimitHours = config('auto_reply.rate_limit_hours', 24);
                    
                    if (Cache::has($rateLimitKey)) {
                        $this->info("❌ Rate limited - already sent auto-reply to this sender within {$rateLimitHours} hours");
                        return;
                    }
                    
                    // Dispatch auto-reply job
                    $delaySeconds = config('auto_reply.job_delay_seconds', 10);
                    ProcessAutoReply::dispatch($email, $userId)->delay(now()->addSeconds($delaySeconds));
                    $this->info("✅ ProcessAutoReply job dispatched with {$delaySeconds}s delay");
                    
                    // Set rate limit
                    Cache::put($rateLimitKey, true, now()->addHours($rateLimitHours));
                    
                } else {
                    if (empty($senderEmail)) {
                        $this->info("❌ Skipping - empty sender email");
                    } else {
                        $this->info("❌ Skipping - system/own email: {$senderEmail}");
                    }
                }
            } else {
                $this->info("❌ Email not addressed to auto-reply address");
                $this->info("   Expected: {$autoReplyEmailAddress}");
                $this->info("   Got: {$recipientEmail}");
            }
            
        } catch (\Exception $e) {
            $this->error("❌ Error checking for auto-reply: " . $e->getMessage());
        }
    }
}