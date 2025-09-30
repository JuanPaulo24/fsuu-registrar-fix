<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Facades\Log;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $messageId;
    public $messageText;
    public $senderId;
    public $senderName;
    public $senderAvatar;
    public $conversationId;
    public $createdAt;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        \Log::info('📡 MessageSent event constructor started for message ID: ' . $message->id);
        
        try {
            // Load the sender relationship explicitly to avoid serialization issues
            \Log::info('📡 Loading sender relationship...');
            $message->load('sender.profile');
            \Log::info('📡 Sender relationship loaded successfully');
            
            // Extract primitive data to avoid serialization issues
            $this->messageId = $message->id;
            $this->messageText = $message->message;
            $this->senderId = $message->sender_id;
            $this->conversationId = $message->conversation_id;
            $this->createdAt = $message->created_at->toISOString();
            
            // Safely get sender info
            $profile = $message->sender->profile ?? null;
            if ($profile) {
                $this->senderName = trim(($profile->firstname ?? '') . ' ' . ($profile->lastname ?? '')) ?: 'Unknown User';
                $this->senderAvatar = $profile->profile_picture ?? null;
            } else {
                $this->senderName = 'Unknown User';
                $this->senderAvatar = null;
            }
            
            \Log::info('📡 Event setup complete for conversation ID: ' . $this->conversationId);
            \Log::info('📡 Sender: ' . $this->senderName);
            
        } catch (\Exception $e) {
            \Log::error('📡 Error in MessageSent constructor: ' . $e->getMessage());
            \Log::error('📡 Constructor stack trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        \Log::info('📡 broadcastOn called for conversation ID: ' . $this->conversationId);
        
        try {
            $channels = [
                new PrivateChannel('conversation.' . $this->conversationId),
            ];
            
            \Log::info('📡 Broadcast channels created successfully');
            return $channels;
            
        } catch (\Exception $e) {
            \Log::error('📡 Error in broadcastOn: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        \Log::info('📡 Starting broadcastWith for message ID: ' . $this->messageId);
        
        try {
            // Use primitive data to avoid serialization issues
            $broadcastData = [
                'message' => [
                    'id' => $this->messageId,
                    'conversation_id' => $this->conversationId,
                    'sender_id' => $this->senderId,
                    'message' => $this->messageText,
                    'type' => 'text',
                    'created_at' => $this->createdAt,
                    'sender' => [
                        'id' => $this->senderId,
                        'name' => $this->senderName,
                        'avatar' => $this->senderAvatar
                    ]
                ]
            ];
            
            \Log::info('📡 Broadcast data prepared successfully');
            return $broadcastData;
            
        } catch (\Exception $e) {
            \Log::error('📡 Error in broadcastWith: ' . $e->getMessage());
            \Log::error('📡 Stack trace: ' . $e->getTraceAsString());
            throw $e; // Re-throw to see the actual error
        }
    }
}
 
 




