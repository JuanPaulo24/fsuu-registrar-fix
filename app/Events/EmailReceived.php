<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Facades\Log;

class EmailReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    /**
     * The queue on which to place the broadcasting job.
     */
    public $broadcastQueue = 'default';

    public $emailId;
    public $folder;
    public $emailData;
    public $userId;

    /**
     * Create a new event instance.
     */
    public function __construct($emailData, $folder = 'inbox', $userId = null)
    {
        $this->emailId = $emailData['id'] ?? null;
        $this->folder = $folder;
        $this->emailData = $emailData;
        $this->userId = $userId ?? auth()->id();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.emails.' . $this->userId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'email.received';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'email' => $this->emailData,
            'folder' => $this->folder,
            'timestamp' => now()->toISOString()
        ];
    }
}