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

class CheckSentEmails implements ShouldQueue
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

        // Check if real-time WebSocket is active - if so, skip polling
        $realtimeActive = Cache::get("realtime_email_active_user_{$this->userId}", false);
        if ($realtimeActive) {
            Log::info("CheckSentEmails: Skipping job for user {$this->userId} - real-time WebSocket is active");
            return;
        }

        try {
            // Get the latest emails from sent folder
            $latestEmails = $gmailService->getSentEmails(10);
            
            if (empty($latestEmails)) {
                return;
            }

            // Cache key for storing last checked sent email IDs
            $cacheKey = "gmail_last_checked_sent_emails_user_{$this->userId}";
            
            // Get previously checked email IDs from cache
            $lastCheckedIds = Cache::get($cacheKey, []);
            
            // Find new emails
            $newEmails = array_filter($latestEmails, function ($email) use ($lastCheckedIds) {
                return !in_array($email['id'], $lastCheckedIds);
            });
            
            if (!empty($newEmails)) {
                // Broadcast each new sent email
                foreach ($newEmails as $email) {
                    event(new EmailReceived($email, 'sent', $this->userId));
                }
                
                // Update cache with all current email IDs
                $currentIds = array_column($latestEmails, 'id');
                Cache::put($cacheKey, $currentIds, now()->addDays(1));
            }

        } catch (\Exception $e) {
            throw $e; // Re-throw to mark job as failed
        }
    }
}