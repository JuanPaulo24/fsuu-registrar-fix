<?php

namespace App\Http\Controllers;

use App\Services\EmailMentionService;
use Illuminate\Http\Request;

class EmailMentionController extends Controller
{
    protected $emailMentionService;

    public function __construct(EmailMentionService $emailMentionService)
    {
        $this->emailMentionService = $emailMentionService;
    }

    /**
     * Get email suggestions based on search query
     */
    public function getEmailSuggestions(Request $request)
    {
        try {
            $searchQuery = $request->get('q', '');
            $suggestions = $this->emailMentionService->getEmailSuggestions($searchQuery);

            return response()->json([
                'success' => true,
                'data' => $suggestions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get email suggestions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all user emails organized by role
     */
    public function getAllUsersByRole(Request $request)
    {
        try {
            $data = $this->emailMentionService->getAllUserEmailsByRole();

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get users by role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Expand mention to actual email addresses
     */
    public function expandMention(Request $request)
    {
        try {
            $request->validate([
                'mention' => 'required|string'
            ]);

            $emails = $this->emailMentionService->expandMention($request->mention);

            return response()->json([
                'success' => true,
                'data' => [
                    'mention' => $request->mention,
                    'emails' => $emails,
                    'count' => count($emails)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to expand mention: ' . $e->getMessage()
            ], 500);
        }
    }
}