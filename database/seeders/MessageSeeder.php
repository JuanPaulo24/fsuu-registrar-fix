<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get first 3 users for testing
        $users = User::with('profile')->take(3)->get();
        
        if ($users->count() < 2) {
            $this->command->info('Not enough users found. Please ensure you have at least 2 users in the database.');
            return;
        }

        // Create a conversation between first two users
        $conversation = Conversation::create([
            'type' => 'private',
            'participants' => [$users[0]->id, $users[1]->id],
            'last_message_at' => now()
        ]);

        // Add some test messages
        $messages = [
            [
                'sender_id' => $users[0]->id,
                'message' => 'Hello! How are you doing today?',
                'created_at' => now()->subMinutes(10)
            ],
            [
                'sender_id' => $users[1]->id,
                'message' => 'Hi there! I\'m doing great, thanks for asking. How about you?',
                'created_at' => now()->subMinutes(8)
            ],
            [
                'sender_id' => $users[0]->id,
                'message' => 'I\'m doing well too! Just working on some projects.',
                'created_at' => now()->subMinutes(5)
            ],
            [
                'sender_id' => $users[1]->id,
                'message' => 'That sounds interesting! What kind of projects?',
                'created_at' => now()->subMinutes(2)
            ]
        ];

        foreach ($messages as $messageData) {
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $messageData['sender_id'],
                'message' => $messageData['message'],
                'type' => 'text',
                'created_at' => $messageData['created_at'],
                'updated_at' => $messageData['created_at']
            ]);
        }

        // Update conversation's last message time
        $conversation->update(['last_message_at' => now()->subMinutes(2)]);

        // Create another conversation if we have a third user
        if ($users->count() >= 3) {
            $conversation2 = Conversation::create([
                'type' => 'private',
                'participants' => [$users[0]->id, $users[2]->id],
                'last_message_at' => now()->subHours(1)
            ]);

            Message::create([
                'conversation_id' => $conversation2->id,
                'sender_id' => $users[2]->id,
                'message' => 'Hey! Long time no see. How have you been?',
                'type' => 'text',
                'created_at' => now()->subHours(1),
                'updated_at' => now()->subHours(1)
            ]);
        }

        $this->command->info('Sample conversations and messages created successfully!');
    }
}
 
 
 
 