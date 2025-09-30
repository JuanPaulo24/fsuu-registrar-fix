<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Profile;
use App\Models\IssuedDocument;
use App\Models\User;
use App\Models\Posting;

class GlobalSearchController extends Controller
{
    /**
     * Perform global search across system components
     */
    public function search(Request $request)
    {
        $query = $request->get('query');
        $category = $request->get('category', 'all');
        $limit = $request->get('limit', 20);

        if (empty($query) || strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'results' => [],
                'total' => 0
            ]);
        }

        $results = [];

        // Search Students/Profiles
        if ($category === 'all' || $category === 'profiles') {
            $profiles = Profile::select('id', 'firstname', 'lastname', 'middlename', 'id_number')
                ->where(function($q) use ($query) {
                    $q->where('firstname', 'LIKE', "%{$query}%")
                      ->orWhere('lastname', 'LIKE', "%{$query}%")
                      ->orWhere('middlename', 'LIKE', "%{$query}%")
                      ->orWhere('id_number', 'LIKE', "%{$query}%")
                      ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$query}%"])
                      ->orWhereRaw("CONCAT(firstname, ' ', middlename, ' ', lastname) LIKE ?", ["%{$query}%"]);
                })
                ->limit(10)
                ->get();

            foreach ($profiles as $profile) {
                $results[] = [
                    'id' => 'profile_' . $profile->id,
                    'title' => $profile->firstname . ' ' . $profile->lastname,
                    'description' => 'Student Profile - ID: ' . $profile->id_number,
                    'category' => 'profiles',
                    'type' => 'student',
                    'path' => '/student-profile/view/' . $profile->id,
                    'icon' => '👤',
                    'relevance' => $this->calculateRelevance($query, [
                        $profile->firstname,
                        $profile->lastname,
                        $profile->id_number
                    ])
                ];
            }
        }

        // Search Documents
        if ($category === 'all' || $category === 'documents') {
            $documents = IssuedDocument::with('profile')
                ->where(function($q) use ($query) {
                    $q->where('document_type', 'LIKE', "%{$query}%")
                      ->orWhere('serial_number', 'LIKE', "%{$query}%")
                      ->orWhere('document_id_number', 'LIKE', "%{$query}%")
                      ->orWhereHas('profile', function($subQ) use ($query) {
                          $subQ->where('firstname', 'LIKE', "%{$query}%")
                               ->orWhere('lastname', 'LIKE', "%{$query}%")
                               ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$query}%"]);
                      });
                })
                ->limit(10)
                ->get();

            foreach ($documents as $doc) {
                $results[] = [
                    'id' => 'document_' . $doc->id,
                    'title' => $doc->document_type . ' - ' . $doc->serial_number,
                    'description' => 'Document for: ' . ($doc->profile ? $doc->profile->firstname . ' ' . $doc->profile->lastname : 'Unknown'),
                    'category' => 'documents',
                    'type' => 'document',
                    'path' => '/document-management',
                    'icon' => '📄',
                    'relevance' => $this->calculateRelevance($query, [
                        $doc->document_type,
                        $doc->serial_number,
                        $doc->profile ? $doc->profile->firstname . ' ' . $doc->profile->lastname : ''
                    ])
                ];
            }
        }

        // Search Users
        if ($category === 'all' || $category === 'administration') {
            $users = User::select('id', 'firstname', 'lastname', 'email', 'role')
                ->where(function($q) use ($query) {
                    $q->where('firstname', 'LIKE', "%{$query}%")
                      ->orWhere('lastname', 'LIKE', "%{$query}%")
                      ->orWhere('email', 'LIKE', "%{$query}%")
                      ->orWhere('role', 'LIKE', "%{$query}%")
                      ->orWhereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$query}%"]);
                })
                ->limit(5)
                ->get();

            foreach ($users as $user) {
                $results[] = [
                    'id' => 'user_' . $user->id,
                    'title' => $user->firstname . ' ' . $user->lastname,
                    'description' => 'User - ' . $user->role . ' (' . $user->email . ')',
                    'category' => 'administration',
                    'type' => 'user',
                    'path' => '/users',
                    'icon' => '👥',
                    'relevance' => $this->calculateRelevance($query, [
                        $user->firstname,
                        $user->lastname,
                        $user->email,
                        $user->role
                    ])
                ];
            }
        }

        // Search Information Panel Posts
        if ($category === 'all' || $category === 'information') {
            try {
                $posts = Posting::select('id', 'title', 'content', 'type', 'status')
                    ->where(function($q) use ($query) {
                        $q->where('title', 'LIKE', "%{$query}%")
                          ->orWhere('content', 'LIKE', "%{$query}%")
                          ->orWhere('type', 'LIKE', "%{$query}%");
                    })
                    ->where('status', 'active')
                    ->limit(5)
                    ->get();

                foreach ($posts as $post) {
                    $results[] = [
                        'id' => 'post_' . $post->id,
                        'title' => $post->title,
                        'description' => 'Information Post - ' . $post->type,
                        'category' => 'information',
                        'type' => 'post',
                        'path' => '/information-panel',
                        'icon' => 'ℹ️',
                        'relevance' => $this->calculateRelevance($query, [
                            $post->title,
                            $post->content,
                            $post->type
                        ])
                    ];
                }
            } catch (\Exception $e) {
                // Posting table might not exist or have different structure
                // Continue without adding posts to results
            }
        }

        // Sort by relevance
        usort($results, function($a, $b) {
            return $b['relevance'] <=> $a['relevance'];
        });

        // Apply limit
        $results = array_slice($results, 0, $limit);

        return response()->json([
            'success' => true,
            'results' => $results,
            'total' => count($results),
            'query' => $query,
            'category' => $category
        ]);
    }

    /**
     * Get quick suggestions for empty search
     */
    public function suggestions(Request $request)
    {
        return response()->json([
            'success' => true,
            'suggestions' => [
                [
                    'title' => 'Recent Students',
                    'description' => 'View recently added student profiles',
                    'path' => '/student-profile',
                    'icon' => '👤'
                ],
                [
                    'title' => 'Document Management',
                    'description' => 'Manage issued documents and certificates',
                    'path' => '/document-management',
                    'icon' => '📄'
                ],
                [
                    'title' => 'System Users',
                    'description' => 'Manage system users and permissions',
                    'path' => '/users',
                    'icon' => '👥'
                ],
                [
                    'title' => 'Dashboard',
                    'description' => 'View system overview and analytics',
                    'path' => '/dashboard',
                    'icon' => '🏠'
                ]
            ]
        ]);
    }

    /**
     * Calculate relevance score for search results
     */
    private function calculateRelevance($query, $fields)
    {
        $score = 0;
        $normalizedQuery = strtolower(trim($query));
        
        foreach ($fields as $field) {
            if (empty($field)) continue;
            
            $normalizedField = strtolower(trim($field));
            
            // Exact match gets highest score
            if ($normalizedField === $normalizedQuery) {
                $score += 100;
            }
            // Starts with query gets high score
            elseif (strpos($normalizedField, $normalizedQuery) === 0) {
                $score += 80;
            }
            // Contains query gets medium score
            elseif (strpos($normalizedField, $normalizedQuery) !== false) {
                $score += 50;
            }
            // Word boundary match gets good score
            elseif (preg_match('/\b' . preg_quote($normalizedQuery, '/') . '\b/', $normalizedField)) {
                $score += 70;
            }
        }
        
        return $score;
    }
}
