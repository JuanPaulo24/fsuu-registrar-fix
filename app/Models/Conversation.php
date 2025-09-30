<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory, ModelTrait;

    protected $fillable = [
        'type',
        'title',
        'participants',
        'last_message_at'
    ];

    protected $casts = [
        'participants' => 'array',
        'last_message_at' => 'datetime'
    ];

    /**
     * Get messages for this conversation
     */
    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Get the latest message
     */
    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latest();
    }

    /**
     * Get participants as User models
     */
    public function participantUsers()
    {
        return User::whereIn('id', $this->participants)->get();
    }

    /**
     * Check if user is participant
     */
    public function hasParticipant($userId)
    {
        return in_array($userId, $this->participants);
    }

    /**
     * Add participant to conversation
     */
    public function addParticipant($userId)
    {
        $participants = $this->participants;
        if (!in_array($userId, $participants)) {
            $participants[] = $userId;
            $this->participants = $participants;
            $this->save();
        }
    }

    /**
     * Remove participant from conversation
     */
    public function removeParticipant($userId)
    {
        $participants = array_filter($this->participants, function($id) use ($userId) {
            return $id != $userId;
        });
        $this->participants = array_values($participants);
        $this->save();
    }
}
 
 
 
 