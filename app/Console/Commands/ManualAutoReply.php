<?php

namespace App\Console\Commands;

use App\Jobs\ProcessAutoReply;
use App\Services\GmailService;
use Illuminate\Console\Command;

class ManualAutoReply extends Command
{
    protected $signature = 'auto-reply:manual {--user-id=1}';
    protected $description = 'Manually trigger auto-replies for recent emails';

    public function handle()
    {
        $userId = $this->option('user-id');
        $gmailService = app(GmailService::class);
        
        if (!$gmailService->isReady()) {
            $this->error('Gmail service not ready');
            return 1;
        }
        
        $this->info('🔍 Fetching recent emails...');
        $emails = $gmailService->getInboxEmails(10);
        
        $autoReplyEmail = 'jburgers728@gmail.com';
        $processedCount = 0;
        
        foreach ($emails as $email) {
            $recipientEmail = $email['toEmail'] ?? $email['to'] ?? '';
            if (preg_match('/<(.+)>/', $recipientEmail, $matches)) {
                $recipientEmail = $matches[1];
            }
            
            if (strtolower(trim($recipientEmail)) === strtolower($autoReplyEmail)) {
                $senderEmail = $email['fromEmail'] ?? $email['from'] ?? '';
                if (preg_match('/<(.+)>/', $senderEmail, $matches)) {
                    $senderEmail = $matches[1];
                }
                
                if ($senderEmail && $senderEmail !== $autoReplyEmail) {
                    $this->info("📧 Processing: {$email['subject']} from {$senderEmail}");
                    
                    // Dispatch ProcessAutoReply job directly
                    ProcessAutoReply::dispatch($email, $userId);
                    $processedCount++;
                    
                    $this->info("✅ Auto-reply job dispatched");
                }
            }
        }
        
        $this->info("🚀 Dispatched {$processedCount} auto-reply jobs");
        $this->info("💡 Run 'php artisan queue:work --once --verbose' to process them");
        
        return 0;
    }
}