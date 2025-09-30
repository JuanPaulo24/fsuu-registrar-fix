<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    /**
     * Get all conversations for the authenticated user
     */
    public function getConversations()
    {
        try {
            $userId = Auth::id();
            
            $conversations = Conversation::whereJsonContains('participants', $userId)
                ->with(['latestMessage.sender.profile'])
                ->orderBy('last_message_at', 'desc')
                ->get();

            $conversationsData = $conversations->map(function ($conversation) use ($userId) {
                $otherParticipantIds = array_filter($conversation->participants, function($id) use ($userId) {
                    return $id != $userId;
                });
                
                $otherParticipants = User::whereIn('id', $otherParticipantIds)
                    ->with('profile')
                    ->get();

                return [
                    'id' => $conversation->id,
                    'type' => $conversation->type,
                    'title' => $conversation->title,
                    'participants' => $otherParticipants->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->profile->firstname . ' ' . $user->profile->lastname,
                            'avatar' => $user->profile->profile_picture ?? null,
                        ];
                    }),
                    'latest_message' => $conversation->latestMessage ? [
                        'message' => $conversation->latestMessage->message,
                        'created_at' => $conversation->latestMessage->created_at->diffForHumans(),
                        'sender_name' => $conversation->latestMessage->sender->profile->firstname . ' ' . $conversation->latestMessage->sender->profile->lastname,
                    ] : null,
                    'last_message_at' => $conversation->last_message_at?->diffForHumans(),
                ];
            });

            return response()->json([
                'success' => true,
                'conversations' => $conversationsData
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching conversations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch conversations'
            ], 500);
        }
    }

    /**
     * Get messages for a specific conversation
     */
    public function getMessages($conversationId)
    {
        try {
            $userId = Auth::id();
            
            $conversation = Conversation::find($conversationId);
            
            if (!$conversation || !$conversation->hasParticipant($userId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found or unauthorized'
                ], 404);
            }

            $messages = Message::where('conversation_id', $conversationId)
                ->with('sender.profile')
                ->orderBy('created_at', 'asc')
                ->get();

            $messagesData = $messages->map(function ($message) use ($userId) {
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'type' => $message->type,
                    'metadata' => $message->metadata,
                    'created_at' => $message->created_at->format('Y-m-d H:i:s'),
                    'sender' => [
                        'id' => $message->sender_id,
                        'name' => $message->sender->profile->firstname . ' ' . $message->sender->profile->lastname,
                        'avatar' => $message->sender->profile->profile_picture ?? null,
                        'is_current_user' => $message->sender_id == $userId,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'messages' => $messagesData
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching messages: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch messages'
            ], 500);
        }
    }

    /**
     * Send a new message
     */
    public function sendMessage(Request $request)
    {
        try {
            \Log::info('🚀 SendMessage API called');
            \Log::info('📦 Request data: ' . json_encode($request->all()));
            \Log::info('👤 User ID: ' . Auth::id());

            $request->validate([
                'conversation_id' => 'required|exists:conversations,id',
                'message' => 'required|string|max:1000',
                'type' => 'nullable|string|in:text,image,file'
            ]);

            $userId = Auth::id();
            $conversationId = $request->conversation_id;
            \Log::info('✅ Validation passed');

            $conversation = Conversation::find($conversationId);
            
            if (!$conversation || !$conversation->hasParticipant($userId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found or unauthorized'
                ], 404);
            }

            $message = Message::create([
                'conversation_id' => $conversationId,
                'sender_id' => $userId,
                'message' => $request->message,
                'type' => $request->type ?? 'text',
                'metadata' => $request->metadata ?? null
            ]);

            // Update conversation's last message timestamp
            $conversation->update(['last_message_at' => now()]);

            // Load the sender relationship
            $message->load('sender.profile');

            // Broadcast the message
            \Log::info('📡 Broadcasting message with ID: ' . $message->id);
            broadcast(new MessageSent($message));
            \Log::info('✅ Message broadcasted successfully');

            return response()->json([
                'success' => true,
                'message' => [
                    'id' => $message->id,
                    'message' => $message->message,
                    'type' => $message->type,
                    'created_at' => $message->created_at->format('Y-m-d H:i:s'),
                    'sender' => [
                        'id' => $message->sender_id,
                        'name' => $message->sender->profile->firstname . ' ' . $message->sender->profile->lastname,
                        'avatar' => $message->sender->profile->profile_picture ?? null,
                        'is_current_user' => true,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('❌ Error sending message: ' . $e->getMessage());
            \Log::error('❌ Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message'
            ], 500);
        }
    }

    /**
     * Start a new conversation
     */
    public function startConversation(Request $request)
    {
        try {
            $request->validate([
                'participant_id' => 'required|exists:users,id',
                'message' => 'required|string|max:1000'
            ]);

            $userId = Auth::id();
            $participantId = $request->participant_id;

            if ($userId == $participantId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot start conversation with yourself'
                ], 400);
            }

            // Check if conversation already exists
            $existingConversation = Conversation::where('type', 'private')
                ->whereJsonContains('participants', $userId)
                ->whereJsonContains('participants', $participantId)
                ->first();

            if ($existingConversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation already exists',
                    'conversation_id' => $existingConversation->id
                ]);
            }

            DB::beginTransaction();

            // Create new conversation
            $conversation = Conversation::create([
                'type' => 'private',
                'participants' => [$userId, $participantId],
                'last_message_at' => now()
            ]);

            // Send initial message
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $userId,
                'message' => $request->message,
                'type' => 'text'
            ]);

            $message->load('sender.profile');

            // Broadcast the message
            broadcast(new MessageSent($message));

            DB::commit();

            return response()->json([
                'success' => true,
                'conversation' => [
                    'id' => $conversation->id,
                    'type' => $conversation->type,
                ],
                'message' => [
                    'id' => $message->id,
                    'message' => $message->message,
                    'created_at' => $message->created_at->format('Y-m-d H:i:s'),
                    'sender' => [
                        'id' => $message->sender_id,
                        'name' => $message->sender->profile->firstname . ' ' . $message->sender->profile->lastname,
                        'avatar' => $message->sender->profile->profile_picture ?? null,
                        'is_current_user' => true,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error starting conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to start conversation'
            ], 500);
        }
    }

    /**
     * Get all users for messaging (excluding current user)
     */
    public function getUsers()
    {
        try {
            $userId = Auth::id();
            
            $users = User::where('id', '!=', $userId)
                ->where('status', 'active')
                ->with('profile')
                ->get();

            $usersData = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->profile->firstname . ' ' . $user->profile->lastname,
                    'avatar' => $user->profile->profile_picture ?? null,
                ];
            });

            return response()->json([
                'success' => true,
                'users' => $usersData
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching users: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users'
            ], 500);
        }
    }
}
 
 
 
 