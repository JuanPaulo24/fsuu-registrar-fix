<?php

namespace App\Console\Commands;

use App\Events\MessageSent;
use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Console\Command;

class TestMessaging extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'messaging:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the messaging system and broadcasting';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Testing Messaging System...');
        $this->newLine();

        // Check if we have users
        $userCount = User::count();
        if ($userCount < 2) {
            $this->error("❌ Need at least 2 users to test messaging. Found: {$userCount}");
            return;
        }

        $this->line("✅ Found {$userCount} users");

        // Get first two users
        $users = User::take(2)->get();
        $this->line("✅ Using users: {$users[0]->email} and {$users[1]->email}");

        // Check if conversation exists
        $conversation = Conversation::whereJsonContains('participants', $users[0]->id)
            ->whereJsonContains('participants', $users[1]->id)
            ->first();

        if (!$conversation) {
            $this->line("📝 Creating test conversation...");
            $conversation = Conversation::create([
                'type' => 'private',
                'participants' => [$users[0]->id, $users[1]->id],
                'last_message_at' => now()
            ]);
            $this->line("✅ Conversation created with ID: {$conversation->id}");
        } else {
            $this->line("✅ Using existing conversation ID: {$conversation->id}");
        }

        // Create a test message
        $this->line("💬 Creating test message...");
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $users[0]->id,
            'message' => 'Test message from artisan command at ' . now(),
            'type' => 'text'
        ]);

        $this->line("✅ Message created with ID: {$message->id}");

        // Test broadcasting
        $this->line("📡 Testing message broadcasting...");
        try {
            $message->load('sender.profile');
            broadcast(new MessageSent($message));
            $this->line("✅ Message broadcast successfully!");
        } catch (\Exception $e) {
            $this->error("❌ Broadcasting failed: " . $e->getMessage());
        }

        $this->newLine();
        $this->info("🎉 Messaging test complete!");
        $this->line("You can now test the messaging interface in your application.");
    }
}
 
 
 
 