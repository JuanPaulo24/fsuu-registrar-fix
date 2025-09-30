<?php

namespace App\Console\Commands;

use App\Events\EmailReceived;
use App\Services\GmailService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MonitorGmailEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'gmail:monitor {--user-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor Gmail for new emails and broadcast real-time updates';

    protected $gmailService;

    public function __construct(GmailService $gmailService)
    {
        parent::__construct();
        $this->gmailService = $gmailService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id') ?? 1; // Default to admin user
        
        Log::info('📧 Starting Gmail monitoring for user: ' . $userId);
        $this->info('Starting Gmail email monitoring...');

        if (!$this->gmailService->isReady()) {
            $this->error('Gmail service is not ready. Check credentials and tokens.');
            Log::error('📧 Gmail service not ready for monitoring');
            return 1;
        }

        // Cache key for storing last checked email IDs
        $cacheKey = "gmail_last_checked_emails_user_{$userId}";
        
        while (true) {
            try {
                // Get the latest emails from inbox
                $this->info('Checking for new emails...');
                $latestEmails = $this->gmailService->getInboxEmails(10); // Get latest 10 emails
                
                if (!empty($latestEmails)) {
                    // Get previously checked email IDs from cache
                    $lastCheckedIds = Cache::get($cacheKey, []);
                    
                    // Find new emails
                    $newEmails = array_filter($latestEmails, function ($email) use ($lastCheckedIds) {
                        return !in_array($email['id'], $lastCheckedIds);
                    });
                    
                    if (!empty($newEmails)) {
                        $this->info('Found ' . count($newEmails) . ' new emails');
                        Log::info('📧 Found ' . count($newEmails) . ' new emails');
                        
                        // Broadcast each new email
                        foreach ($newEmails as $email) {
                            Log::info('📧 Broadcasting new email: ' . $email['id']);
                            event(new EmailReceived($email, 'inbox', $userId));
                            $this->info('Broadcasted new email: ' . $email['subject']);
                        }
                        
                        // Update cache with all current email IDs
                        $currentIds = array_column($latestEmails, 'id');
                        Cache::put($cacheKey, $currentIds, now()->addDays(1));
                    } else {
                        $this->info('No new emails found');
                    }
                } else {
                    $this->info('No emails retrieved');
                }
                
                // Wait 30 seconds before checking again
                sleep(30);
                
            } catch (\Exception $e) {
                $this->error('Error monitoring emails: ' . $e->getMessage());
                Log::error('📧 Error in email monitoring: ' . $e->getMessage());
                
                // Wait 60 seconds before retrying on error
                sleep(60);
            }
        }
    }
}