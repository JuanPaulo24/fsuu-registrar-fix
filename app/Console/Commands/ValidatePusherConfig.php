<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Pusher\Pusher;

class ValidatePusherConfig extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pusher:validate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Validate Pusher configuration and connectivity';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Validating Pusher Configuration...');
        $this->newLine();

        // Check environment variables
        $this->checkEnvironmentVariables();
        
        // Check broadcasting configuration
        $this->checkBroadcastingConfig();
        
        // Test Pusher connection
        $this->testPusherConnection();
        
        $this->newLine();
        $this->info('✅ Pusher validation complete!');
    }

    private function checkEnvironmentVariables()
    {
        $this->info('📋 Checking Environment Variables:');
        
        $requiredVars = [
            'BROADCAST_DRIVER',
            'PUSHER_APP_ID',
            'PUSHER_APP_KEY',
            'PUSHER_APP_SECRET',
            'PUSHER_APP_CLUSTER'
        ];

        foreach ($requiredVars as $var) {
            $value = env($var);
            if ($value) {
                $displayValue = in_array($var, ['PUSHER_APP_SECRET']) ? '***hidden***' : $value;
                $this->line("   ✅ {$var}: {$displayValue}");
            } else {
                $this->error("   ❌ {$var}: Not set");
            }
        }
        
        $this->newLine();
    }

    private function checkBroadcastingConfig()
    {
        $this->info('⚙️  Checking Broadcasting Configuration:');
        
        $driver = config('broadcasting.default');
        $this->line("   Current Driver: {$driver}");
        
        if ($driver === 'pusher') {
            $config = config('broadcasting.connections.pusher');
            $this->line("   ✅ Broadcasting driver set to Pusher");
            $this->line("   Pusher Key: " . ($config['key'] ? '✅ Set' : '❌ Missing'));
            $this->line("   Pusher Secret: " . ($config['secret'] ? '✅ Set' : '❌ Missing'));
            $this->line("   Pusher App ID: " . ($config['app_id'] ? '✅ Set' : '❌ Missing'));
            $this->line("   Pusher Cluster: " . ($config['options']['cluster'] ?? 'Not set'));
        } else {
            $this->warn("   ⚠️  Broadcasting driver is not set to 'pusher'");
        }
        
        $this->newLine();
    }

    private function testPusherConnection()
    {
        $this->info('🔗 Testing Pusher Connection:');
        
        try {
            $pusher = new Pusher(
                env('PUSHER_APP_KEY'),
                env('PUSHER_APP_SECRET'),
                env('PUSHER_APP_ID'),
                [
                    'cluster' => env('PUSHER_APP_CLUSTER'),
                    'useTLS' => true
                ]
            );

            // Test with a simple trigger
            $result = $pusher->trigger('test-channel', 'test-event', [
                'message' => 'Test connection successful!',
                'timestamp' => now()->toISOString()
            ]);

            if ($result) {
                $this->line("   ✅ Pusher connection successful!");
                $this->line("   ✅ Test event triggered successfully");
            } else {
                $this->error("   ❌ Failed to trigger test event");
            }

        } catch (\Exception $e) {
            $this->error("   ❌ Pusher connection failed: " . $e->getMessage());
            $this->newLine();
            $this->warn("💡 Common solutions:");
            $this->line("   • Check your Pusher credentials are correct");
            $this->line("   • Ensure your Pusher cluster is correct");
            $this->line("   • Verify your Pusher app is active");
            $this->line("   • Check your internet connection");
        }
        
        $this->newLine();
    }
}
 
 
 
 