<?php

namespace App\Console\Commands;

use App\Jobs\CheckNewEmails;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class RunAutoReplySystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auto-reply:run {--user-id=1}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run the complete auto-reply system (scheduler + queue worker)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');
        
        $this->info("🤖 Starting FSUU Auto-Reply System");
        $this->info("==================================");
        
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
        $this->info("");
        
        $this->info("🚀 Auto-Reply System Features:");
        $this->info("   • ⏰ Checks for new emails every 2 minutes");
        $this->info("   • 🎯 Auto-replies to emails sent to {$autoReplyEmail}");
        $this->info("   • 🚫 Rate limited (1 reply per sender per 24 hours)");
        $this->info("   • 🔄 Works independently of browser/frontend");
        $this->info("");
        
        $this->info("📋 System Status:");
        $this->info("   • Scheduler: Will dispatch CheckNewEmails jobs every 2 minutes");
        $this->info("   • Queue Worker: Will process auto-reply jobs immediately");
        $this->info("");
        
        $this->info("🎯 To test: Send an email TO {$autoReplyEmail} from any external email");
        $this->info("");
        $this->info("Press Ctrl+C to stop the system");
        $this->info("=====================================");
        
        // Dispatch initial job to check for any existing emails
        $this->info("📧 Dispatching initial email check...");
        CheckNewEmails::dispatch($userId);
        
        // Start both scheduler and queue worker
        $this->info("🔄 Starting scheduler and queue worker...");
        $this->info("");
        
        // Use Laravel's built-in schedule:work command which runs the scheduler continuously
        // This will handle the every 2 minutes CheckNewEmails dispatch
        $schedulerProcess = null;
        
        // Start scheduler in background using PHP's proc_open
        $schedulerCmd = 'php artisan schedule:work';
        $schedulerProcess = proc_open(
            $schedulerCmd,
            [
                0 => ['pipe', 'r'],  // stdin
                1 => ['pipe', 'w'],  // stdout
                2 => ['pipe', 'w']   // stderr
            ],
            $pipes,
            base_path()
        );
        
        if (!$schedulerProcess) {
            $this->error("❌ Failed to start scheduler process");
            return 1;
        }
        
        $this->info("✅ Scheduler started in background");
        
        // Handle Ctrl+C to clean up processes
        pcntl_signal(SIGINT, function() use ($schedulerProcess) {
            $this->info("\n🛑 Stopping Auto-Reply System...");
            
            if ($schedulerProcess) {
                proc_terminate($schedulerProcess);
                proc_close($schedulerProcess);
            }
            
            $this->info("✅ Auto-Reply System stopped");
            exit(0);
        });
        
        // Run queue worker in foreground so we can see the output
        $this->info("🔄 Starting queue worker (foreground)...");
        $this->info("");
        
        // Run queue worker - this will block and show output
        Artisan::call('queue:work', [
            '--daemon' => true,
            '--timeout' => 60,
            '--memory' => 512,
            '--verbose' => true
        ]);
        
        // Cleanup (this won't be reached unless queue:work exits)
        if ($schedulerProcess) {
            proc_terminate($schedulerProcess);
            proc_close($schedulerProcess);
        }
        
        return 0;
    }
}