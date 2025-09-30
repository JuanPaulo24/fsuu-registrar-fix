<?php

namespace App\Console\Commands;

use App\Jobs\CheckNewEmails;
use Illuminate\Console\Command;

class MonitorEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emails:check {--user-id=1}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch job to check for new emails and broadcast updates';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');
        
        $this->info("Dispatching email check job for user {$userId}...");
        
        CheckNewEmails::dispatch($userId);
        
        $this->info('Email check job dispatched successfully!');
    }
}
