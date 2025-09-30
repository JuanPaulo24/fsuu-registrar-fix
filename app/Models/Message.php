<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory, ModelTrait;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'message',
        'type',
        'metadata',
        'read_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'read_at' => 'datetime'
    ];

    /**
     * Get the conversation this message belongs to
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the sender of this message
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Mark message as read
     */
    public function markAsRead()
    {
        $this->read_at = now();
        $this->save();
    }

    /**
     * Check if message is read
     */
    public function isRead()
    {
        return !is_null($this->read_at);
    }
}
 
 
 
 