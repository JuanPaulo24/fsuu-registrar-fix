<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DraftSaved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $draftData;

    /**
     * Create a new event instance.
     */
    public function __construct($draftData)
    {
        $this->draftData = $draftData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.emails.' . $this->draftData['user_id']),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'email.draft.saved';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->draftData['user_id'],
            'draft_data' => $this->draftData['draft_data'],
            'timestamp' => $this->draftData['timestamp'],
        ];
    }
}