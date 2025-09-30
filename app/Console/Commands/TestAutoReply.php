<?php

namespace App\Console\Commands;

use App\Jobs\ProcessAutoReply;
use Illuminate\Console\Command;

class TestAutoReply extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test-auto-reply {--sender-email=test@example.com} {--sender-name=Test User}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the auto-reply functionality with a mock email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $senderEmail = $this->option('sender-email');
        $senderName = $this->option('sender-name');
        
        $this->info('🧪 Testing auto-reply functionality...');
        $this->info("Sender Email: {$senderEmail}");
        $this->info("Sender Name: {$senderName}");
        
        // Create a mock incoming email
        $mockEmail = [
            'id' => 'test_' . time(),
            'threadId' => 'test_thread_' . time(),
            'from' => "{$senderName} <{$senderEmail}>",
            'fromEmail' => $senderEmail,
            'to' => 'jburgers728@gmail.com',
            'toEmail' => 'jburgers728@gmail.com',
            'subject' => 'Test Email for Auto-Reply',
            'body' => 'This is a test email to trigger auto-reply functionality.',
            'date' => date('Y-m-d H:i A'),
            'folder' => 'inbox'
        ];
        
        $this->info('📧 Mock email created:');
        $this->line("  Subject: {$mockEmail['subject']}");
        $this->line("  From: {$mockEmail['from']}");
        $this->line("  To: {$mockEmail['to']}");
        
        // Dispatch the auto-reply job
        $this->info('🚀 Dispatching auto-reply job...');
        ProcessAutoReply::dispatch($mockEmail, 1);
        
        $this->info('✅ Auto-reply job dispatched successfully!');
        $this->info('💡 Check the logs and queue:work output to see the auto-reply processing.');
        $this->info('📋 Run "php artisan queue:work" if it\'s not already running.');
        
        return 0;
    }
}