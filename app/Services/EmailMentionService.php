<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\DB;

class EmailMentionService
{
    /**
     * Get all user emails organized by role
     */
    public function getAllUserEmailsByRole()
    {
        $users = User::with('userRole')
            ->whereNotNull('email')
            ->where('status', 'Active')
            ->get();

        $result = [
            'all_emails' => [],
            'roles' => []
        ];

        // Collect all emails
        foreach ($users as $user) {
            if ($user->email && filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
                $result['all_emails'][] = $user->email;
            }
        }

        // Group by roles
        $roleGroups = [];
        foreach ($users as $user) {
            if ($user->email && filter_var($user->email, FILTER_VALIDATE_EMAIL) && $user->userRole) {
                $roleName = $user->userRole->user_role;
                if (!isset($roleGroups[$roleName])) {
                    $roleGroups[$roleName] = [];
                }
                $roleGroups[$roleName][] = $user->email;
            }
        }

        // Format role data
        foreach ($roleGroups as $roleName => $emails) {
            $result['roles'][] = [
                'role_name' => $roleName,
                'mention_key' => '@' . strtolower(str_replace(' ', '', $roleName)),
                'display_name' => '@' . strtolower(str_replace(' ', '', $roleName)),
                'emails' => array_unique($emails),
                'count' => count(array_unique($emails))
            ];
        }

        // Add special mentions
        $result['special_mentions'] = [
            [
                'mention_key' => '@all',
                'display_name' => '@all',
                'description' => 'All users in the system',
                'emails' => array_unique($result['all_emails']),
                'count' => count(array_unique($result['all_emails']))
            ],
            [
                'mention_key' => '@everyone',
                'display_name' => '@everyone', 
                'description' => 'All users in the system',
                'emails' => array_unique($result['all_emails']),
                'count' => count(array_unique($result['all_emails']))
            ]
        ];

        return $result;
    }

    /**
     * Get email suggestions based on search query
     */
    public function getEmailSuggestions($searchQuery = '')
    {
        $suggestions = [];
        
        // If search starts with @, show mention suggestions
        if (str_starts_with($searchQuery, '@')) {
            $mentionData = $this->getAllUserEmailsByRole();
            
            // Add special mentions
            foreach ($mentionData['special_mentions'] as $mention) {
                if (str_contains($mention['mention_key'], strtolower($searchQuery))) {
            $suggestions[] = [
                'value' => $mention['mention_key'],
                'label' => $mention['display_name'],
                'type' => 'mention',
                'emails' => $mention['emails']
            ];
                }
            }
            
            // Add role-based mentions
            foreach ($mentionData['roles'] as $role) {
                if (str_contains($role['mention_key'], strtolower($searchQuery))) {
                    $suggestions[] = [
                        'value' => $role['mention_key'],
                        'label' => $role['display_name'],
                        'type' => 'mention',
                        'emails' => $role['emails']
                    ];
                }
            }
        } else {
            // Regular email search
            $users = User::whereNotNull('email')
                ->where('status', 'Active');
                
            if ($searchQuery) {
                $users->where('email', 'LIKE', '%' . $searchQuery . '%');
            }
            
            $users = $users->limit(20)->get();
            
            foreach ($users as $user) {
                if ($user->email && filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
                    $suggestions[] = [
                        'value' => $user->email,
                        'label' => $user->email,
                        'type' => 'email'
                    ];
                }
            }
        }

        return $suggestions;
    }

    /**
     * Expand mention to actual email addresses
     */
    public function expandMention($mentionKey)
    {
        $mentionData = $this->getAllUserEmailsByRole();
        
        // Check special mentions first
        foreach ($mentionData['special_mentions'] as $mention) {
            if ($mention['mention_key'] === $mentionKey) {
                return $mention['emails'];
            }
        }
        
        // Check role mentions
        foreach ($mentionData['roles'] as $role) {
            if ($role['mention_key'] === $mentionKey) {
                return $role['emails'];
            }
        }
        
        return [];
    }
}