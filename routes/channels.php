<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;
use App\Models\Conversation;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Private channel for conversations
Broadcast::channel('conversation.{conversationId}', function (User $user, $conversationId) {
    // Check if the user is a participant in this conversation
    $conversation = Conversation::find($conversationId);

    if (!$conversation) {
        return false;
    }

    // Conversation participants are stored as a JSON array of user IDs
    $participants = is_array($conversation->participants) ? $conversation->participants : [];
    return in_array($user->id, $participants);
});

// Presence channel for online status
Broadcast::channel('presence.online', function (User $user) {
    return [
        'id' => $user->id,
        'name' => $user->profile ? $user->profile->firstname . ' ' . $user->profile->lastname : $user->username,
    ];
});

// User's private channel for notifications
Broadcast::channel('user.{userId}', function (User $user, $userId) {
    return (int) $user->id === (int) $userId;
});

// User's private channel for email notifications
Broadcast::channel('user.emails.{userId}', function (User $user, $userId) {
    return (int) $user->id === (int) $userId;
});