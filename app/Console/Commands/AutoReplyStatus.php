<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class AutoReplyStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auto-reply:status {--user-id=1}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check the status of the auto-reply system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');
        
        $this->info("🔍 Auto-Reply System Status");
        $this->info("==========================");
        
        // Configuration
        $enabled = config('auto_reply.enabled', true);
        $email = config('auto_reply.email_address', 'jburgers728@gmail.com');
        $rateLimit = config('auto_reply.rate_limit_hours', 24);
        
        $this->info("📋 Configuration:");
        $this->info("   Enabled: " . ($enabled ? '✅ YES' : '❌ NO'));
        $this->info("   Email: {$email}");
        $this->info("   Rate Limit: {$rateLimit} hours");
        
        // Template
        $template = \App\Models\EmailTemplate::where('template_type', 'auto_reply')
            ->where('system_id', 3)
            ->where('is_active', true)
            ->first();
            
        $this->info("\n📝 Template:");
        if ($template) {
            $this->info("   ✅ Active template: {$template->title}");
            $this->info("   Subject: {$template->subject}");
        } else {
            $this->info("   ❌ No active auto-reply template found");
        }
        
        // Gmail Service
        $gmailService = app(\App\Services\GmailService::class);
        $this->info("\n📧 Gmail Service:");
        if ($gmailService->isReady()) {
            $this->info("   ✅ Gmail API is ready");
        } else {
            $this->info("   ❌ Gmail API is not ready");
        }
        
        // Real-time status
        $realtimeActive = Cache::get("realtime_email_active_user_{$userId}", false);
        $this->info("\n🔄 Real-time Status:");
        $this->info("   Frontend Active: " . ($realtimeActive ? '✅ YES' : '❌ NO'));
        if ($realtimeActive) {
            $this->info("   📝 Note: CheckNewEmails will skip broadcasting but still check for auto-replies");
        }
        
        // Recent auto-replies
        $this->info("\n📨 Recent Auto-Replies:");
        $found = false;
        $testEmails = ['test@example.com', 'user@gmail.com', 'contact@company.com'];
        
        foreach ($testEmails as $testEmail) {
            $cacheKey = "auto_reply_sent_to_" . md5($testEmail);
            if (Cache::has($cacheKey)) {
                $this->info("   📧 Sent to: {$testEmail}");
                $found = true;
            }
        }
        
        if (!$found) {
            $this->info("   ℹ️  No recent auto-replies found");
        }
        
        // Recommendations
        $this->info("\n💡 Next Steps:");
        
        if (!$enabled) {
            $this->info("   1. Set AUTO_REPLY_ENABLED=true in .env");
        }
        
        if (!$template) {
            $this->info("   2. Create an active 'Auto-Reply' email template");
        }
        
        if (!$gmailService->isReady()) {
            $this->info("   3. Configure Gmail API credentials");
        }
        
        $this->info("   4. Run: php artisan auto-reply:start");
        $this->info("   5. Or use: php artisan queue:work --daemon");
        $this->info("   6. Send test email to: {$email}");
        
        return 0;
    }
}