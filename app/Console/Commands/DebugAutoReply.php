<?php

namespace App\Console\Commands;

use App\Services\GmailService;
use App\Jobs\CheckNewEmails;
use Illuminate\Console\Command;

class DebugAutoReply extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auto-reply:debug {--user-id=1}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Debug auto-reply system by showing recent emails and checking logic';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');
        
        $this->info("🔍 Testing Auto-Reply Detection");
        $this->info("================================\n");

        // Test Gmail service
        $this->info("1. Testing Gmail Service...");
        $gmailService = app(GmailService::class);

        if (!$gmailService->isReady()) {
            $this->error("❌ Gmail service is not ready");
            return 1;
        }

        $this->info("✅ Gmail service is ready\n");

        // Get recent emails
        $this->info("2. Fetching recent emails...");
        $emails = $gmailService->getInboxEmails(5);
        $this->info("Found " . count($emails) . " emails\n");

        if (empty($emails)) {
            $this->error("❌ No emails found");
            return 1;
        }

        // Show email details
        $this->info("3. Email Details:");
        foreach ($emails as $index => $email) {
            $this->info("Email #" . ($index + 1) . ":");
            $this->info("  ID: " . $email['id']);
            $this->info("  Subject: " . $email['subject']);
            $this->info("  From: " . ($email['fromEmail'] ?? $email['from'] ?? 'unknown'));
            $this->info("  To: " . ($email['toEmail'] ?? $email['to'] ?? 'unknown'));
            $this->info("  Date: " . $email['date']);
            
            // Check if this would trigger auto-reply
            $autoReplyEmail = config('auto_reply.email_address', 'jburgers728@gmail.com');
            $recipientEmail = $email['toEmail'] ?? $email['to'] ?? '';
            
            // Extract email address from recipient field
            if (preg_match('/<(.+)>/', $recipientEmail, $matches)) {
                $recipientEmail = $matches[1];
            }
            
            if (strtolower(trim($recipientEmail)) === strtolower($autoReplyEmail)) {
                $this->info("  🎯 THIS EMAIL SHOULD TRIGGER AUTO-REPLY!");
                
                $senderEmail = $email['fromEmail'] ?? $email['from'] ?? '';
                if (preg_match('/<(.+)>/', $senderEmail, $matches)) {
                    $senderEmail = $matches[1];
                }
                
                $this->info("  Sender: {$senderEmail}");
                $this->info("  Recipient: {$recipientEmail}");
                
                if (strtolower($senderEmail) === strtolower($autoReplyEmail)) {
                    $this->info("  ❌ But it's from our own email, so will be skipped");
                } else {
                    $this->info("  ✅ Valid for auto-reply!");
                }
            } else {
                $this->info("  ❌ Not addressed to auto-reply email ({$autoReplyEmail})");
            }
            $this->info("");
        }

        // Test job dispatch
        $this->info("4. Testing Job Dispatch...");
        try {
            CheckNewEmails::dispatch($userId);
            $this->info("✅ CheckNewEmails job dispatched successfully");
        } catch (\Exception $e) {
            $this->error("❌ Failed to dispatch job: " . $e->getMessage());
        }

        $this->info("\n5. Check the queue with: php artisan queue:work --once --verbose");
        
        return 0;
    }
}