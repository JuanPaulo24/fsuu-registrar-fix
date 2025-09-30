<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Str;

class GenerateUserUuids extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:generate-uuids';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate UUIDs for existing users who do not have one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating UUIDs for existing users...');

        $users = User::whereNull('uuid')->orWhere('uuid', '')->get();
        
        if ($users->count() === 0) {
            $this->info('All users already have UUIDs!');
            return;
        }

        $this->info("Found {$users->count()} users without UUIDs");

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $user) {
            $user->update(['uuid' => (string) Str::uuid()]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('UUIDs generated successfully for all users!');
    }
}
