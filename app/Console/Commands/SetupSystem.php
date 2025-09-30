<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;

class SetupSystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup:system {--fresh : Run fresh migration instead of regular migration}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup the entire system: migrate with seed, generate passport keys, create personal client, and clean storage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting FSUU Registrar System Setup...');
        $this->newLine();

        try {
            // Step 1: Run migrations with seeding
            $this->info('📦 Step 1: Running migrations with seeding...');
            if ($this->option('fresh')) {
                $this->info('   Running fresh migration (this will drop all tables)...');
                Artisan::call('migrate:fresh --seed', [], $this->getOutput());
            } else {
                $this->info('   Running regular migration with seeding...');
                Artisan::call('migrate --seed', [], $this->getOutput());
            }
            $this->info('✅ Migrations and seeding completed successfully!');
            $this->newLine();

            // Step 2: Generate Passport keys
            $this->info('🔐 Step 2: Generating Passport encryption keys...');
            Artisan::call('passport:keys --force', [], $this->getOutput());
            $this->info('✅ Passport keys generated successfully!');
            $this->newLine();

            // Step 3: Create personal access client automatically
            $this->info('👤 Step 3: Creating Passport personal access client...');
            
            // Use the default name for personal access client
            $clientName = 'FSUU Personal Access Client';
            
            // Call the passport:client command programmatically
            Artisan::call('passport:client', [
                '--personal' => true,
                '--name' => $clientName
            ], $this->getOutput());
            
            $this->info('✅ Personal access client created successfully!');
            $this->newLine();

            // Step 4: Clean storage/app/public (preserve keys directory)
            $this->info('🧹 Step 4: Cleaning storage/app/public directory...');
            $this->cleanStoragePublic();
            $this->info('✅ Storage cleanup completed successfully!');
            $this->newLine();

            // Step 5: Verify setup
            $this->info('🔍 Step 5: Verifying setup...');
            $this->verifySetup();
            $this->newLine();

            // Success message
            $this->info('🎉 System setup completed successfully!');
            $this->info('📋 Summary:');
            $this->info('   ✅ Database migrated and seeded');
            $this->info('   ✅ Passport keys generated');
            $this->info('   ✅ Personal access client created');
            $this->info('   ✅ Storage directory cleaned');
            $this->info('   ✅ System ready for use');
            $this->newLine();
            
            $this->warn('🔔 Important Notes:');
            $this->warn('   • Make sure your .env file is properly configured');
            $this->warn('   • Verify database connection before running this command');
            $this->warn('   • Keys directory in storage/app/public is preserved');

        } catch (\Exception $e) {
            $this->error('❌ Setup failed with error: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }

        return 0;
    }

    /**
     * Clean the storage/app/public directory while preserving the keys directory
     */
    private function cleanStoragePublic()
    {
        $storagePath = storage_path('app/public');
        $keysPath = $storagePath . '/keys';

        if (!File::exists($storagePath)) {
            $this->warn('   Storage/app/public directory does not exist, creating...');
            File::makeDirectory($storagePath, 0755, true);
            return;
        }

        // Get all directories and files in storage/app/public
        $items = File::glob($storagePath . '/*');
        $deletedCount = 0;
        $preservedCount = 0;

        foreach ($items as $item) {
            $itemName = basename($item);
            
            // Preserve the keys directory
            if ($itemName === 'keys') {
                $this->info("   📁 Preserving: keys/");
                $preservedCount++;
                continue;
            }

            // Delete everything else
            try {
                if (File::isDirectory($item)) {
                    File::deleteDirectory($item);
                    $this->info("   🗑️  Deleted directory: $itemName/");
                } else {
                    File::delete($item);
                    $this->info("   🗑️  Deleted file: $itemName");
                }
                $deletedCount++;
            } catch (\Exception $e) {
                $this->warn("   ⚠️  Could not delete $itemName: " . $e->getMessage());
            }
        }

        $this->info("   📊 Cleanup summary: $deletedCount items deleted, $preservedCount items preserved");

        // Ensure .gitignore exists
        $gitignorePath = $storagePath . '/.gitignore';
        if (!File::exists($gitignorePath)) {
            File::put($gitignorePath, "*\n!.gitignore\n!keys/\n");
            $this->info("   📝 Created .gitignore file");
        }
    }

    /**
     * Verify that the setup was completed successfully
     */
    private function verifySetup()
    {
        $errors = [];

        // Check if migrations ran
        try {
            $tables = \DB::select("SHOW TABLES");
            if (empty($tables)) {
                $errors[] = "No database tables found - migrations may have failed";
            } else {
                $this->info("   ✅ Database tables: " . count($tables) . " tables found");
            }
        } catch (\Exception $e) {
            $errors[] = "Database connection error: " . $e->getMessage();
        }

        // Check if Passport keys exist
        $privateKey = storage_path('oauth-private.key');
        $publicKey = storage_path('oauth-public.key');
        
        if (File::exists($privateKey) && File::exists($publicKey)) {
            $this->info("   ✅ Passport keys: Found and accessible");
        } else {
            $errors[] = "Passport keys not found in storage directory";
        }

        // Check if personal access client was created
        try {
            $clients = \DB::table('oauth_clients')->where('personal_access_client', true)->count();
            if ($clients > 0) {
                $this->info("   ✅ Personal access client: Created successfully");
            } else {
                $errors[] = "Personal access client not found in database";
            }
        } catch (\Exception $e) {
            $errors[] = "Could not verify personal access client: " . $e->getMessage();
        }

        // Check storage directory
        $storagePath = storage_path('app/public');
        if (File::exists($storagePath)) {
            $this->info("   ✅ Storage directory: Ready and accessible");
        } else {
            $errors[] = "Storage/app/public directory not accessible";
        }

        // Report errors if any
        if (!empty($errors)) {
            $this->error("   ⚠️  Verification warnings:");
            foreach ($errors as $error) {
                $this->error("      • $error");
            }
        } else {
            $this->info("   ✅ All verification checks passed");
        }
    }
}