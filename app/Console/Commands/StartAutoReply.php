<?php

namespace App\Console\Commands;

use App\Jobs\CheckNewEmails;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class StartAutoReply extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auto-reply:start {--user-id=1} {--interval=120}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Start the auto-reply system by scheduling regular email checks';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');
        $interval = (int) $this->option('interval'); // seconds

        $this->info("🤖 Starting Auto-Reply System");
        $this->info("User ID: {$userId}");
        $this->info("Check Interval: {$interval} seconds");
        
        // Check configuration
        if (!config('auto_reply.enabled', true)) {
            $this->error('❌ Auto-reply is disabled in configuration');
            $this->info('💡 Set AUTO_REPLY_ENABLED=true in .env to enable');
            return 1;
        }

        $autoReplyEmail = config('auto_reply.email_address', 'jburgers728@gmail.com');
        $this->info("📧 Monitoring emails to: {$autoReplyEmail}");
        
        // Check if template exists
        $template = \App\Models\EmailTemplate::where('template_type', 'auto_reply')
            ->where('system_id', 3)
            ->where('is_active', true)
            ->first();
            
        if (!$template) {
            $this->error('❌ No active auto-reply template found');
            $this->info('💡 Create an active "Auto-Reply" template in Email Templates');
            return 1;
        }
        
        $this->info("✅ Using template: {$template->title}");
        
        // Check Gmail service
        $gmailService = app(\App\Services\GmailService::class);
        if (!$gmailService->isReady()) {
            $this->error('❌ Gmail service is not ready');
            $this->info('💡 Check Gmail API credentials in .env');
            return 1;
        }
        
        $this->info("✅ Gmail service is ready");
        
        // Start monitoring
        $this->info("\n🚀 Starting email monitoring...");
        $this->info("Press Ctrl+C to stop");
        
        $count = 0;
        while (true) {
            $count++;
            $this->info("\n[Check #{$count}] " . now()->format('Y-m-d H:i:s'));
            
            try {
                // Dispatch email check job
                CheckNewEmails::dispatch($userId);
                $this->info("📧 Email check job dispatched");
                
                // Process any pending jobs
                $this->call('queue:work', ['--once' => true, '--quiet' => true]);
                
            } catch (\Exception $e) {
                $this->error("❌ Error: " . $e->getMessage());
            }
            
            // Wait for next check
            sleep($interval);
        }
    }
}