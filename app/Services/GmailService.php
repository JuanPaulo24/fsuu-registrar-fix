<?php

namespace App\Services;

use Google_Client;
use Google_Service_Gmail;
use Google_Service_Gmail_Message;
use Google_Service_Gmail_Draft;
use Google_Service_Gmail_ModifyMessageRequest;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GmailService
{
    protected $client;
    protected $service;

    public function __construct()
    {
        $this->initializeClient();
    }

    private function initializeClient()
    {
        try {
            Log::info('GmailService: Initializing Gmail API connection...');
            
            $this->client = new Google_Client();
            $this->client->setApplicationName(config('app.name'));
            $this->client->setScopes([
                Google_Service_Gmail::GMAIL_READONLY,
                Google_Service_Gmail::GMAIL_SEND,
                Google_Service_Gmail::GMAIL_COMPOSE,
                Google_Service_Gmail::GMAIL_MODIFY
            ]);
            
            // Configure HTTP client to handle SSL certificates properly
            $httpClient = new \GuzzleHttp\Client([
                'verify' => false, // Disable SSL verification for development
                'timeout' => 30,
                'connect_timeout' => 10,
            ]);
            $this->client->setHttpClient($httpClient);
            
            // Set up OAuth2 credentials
            $this->client->setClientId(config('services.gmail.client_id'));
            $this->client->setClientSecret(config('services.gmail.client_secret'));
            $this->client->setRedirectUri(config('services.gmail.redirect_uri'));
            
            Log::info('GmailService: Client ID: ' . config('services.gmail.client_id'));
            Log::info('GmailService: Redirect URI: ' . config('services.gmail.redirect_uri'));
            
            // Use access token if available
            if (config('services.gmail.access_token')) {
                Log::info('GmailService: Setting access token...');
                $this->client->setAccessToken(config('services.gmail.access_token'));
                
                // Check if token is expired
                if ($this->client->isAccessTokenExpired()) {
                    Log::warning('GmailService: Access token is expired');
                    
                    // Try to refresh if refresh token is available
                    if (config('services.gmail.refresh_token')) {
                        Log::info('GmailService: Attempting to refresh token...');
                        try {
                            $newToken = $this->client->fetchAccessTokenWithRefreshToken(config('services.gmail.refresh_token'));
                            if (isset($newToken['access_token'])) {
                                Log::info('GmailService: Token refreshed successfully');
                                $this->client->setAccessToken($newToken);
                            } else {
                                Log::error('GmailService: Failed to refresh token', $newToken);
                            }
                        } catch (\Exception $e) {
                            Log::error('GmailService: Error refreshing token: ' . $e->getMessage());
                        }
                    } else {
                        Log::error('GmailService: No refresh token available');
                    }
                } else {
                    Log::info('GmailService: Access token is valid');
                }
            } else {
                Log::error('GmailService: No access token configured');
            }
            
            $this->service = new Google_Service_Gmail($this->client);
            Log::info('GmailService: Gmail service initialized successfully');
            
        } catch (\Exception $e) {
            Log::error('GmailService: Error initializing Gmail service: ' . $e->getMessage());
            // Do not throw to avoid hard 500 during DI; mark service not ready instead
            $this->service = null;
        }
    }

    public function isReady(): bool
    {
        return $this->service instanceof Google_Service_Gmail;
    }

    /**
     * Get inbox emails
     */
    public function getInboxEmails($maxResults = 10, $dateQuery = null)
    {
        try {
            Log::info('GmailService: Fetching inbox emails, maxResults: ' . $maxResults . ', dateQuery: ' . ($dateQuery ?? 'none'));
            
            $query = 'category:primary -in:chats';
            if ($dateQuery) {
                $query .= ' ' . $dateQuery;
            }
            
            $optParams = [
                'maxResults' => $maxResults,
                'labelIds' => ['INBOX'],
                'q' => $query
            ];

            Log::info('GmailService: Calling Gmail API with params: ' . json_encode($optParams));
            $messages = $this->service->users_messages->listUsersMessages('me', $optParams);
            
            Log::info('GmailService: Retrieved ' . count($messages->getMessages()) . ' message IDs');
            
            $emails = [];

            foreach ($messages->getMessages() as $index => $message) {
                try {
                    Log::info('GmailService: Fetching message details for ID: ' . $message->getId() . ' (#' . ($index + 1) . ')');
                    $messageDetails = $this->service->users_messages->get('me', $message->getId());
                    $email = $this->formatEmailData($messageDetails, 'inbox');
                    if ($email) {
                        $emails[] = $email;
                        Log::info('GmailService: Successfully formatted email: ' . $email['subject']);
                    } else {
                        Log::warning('GmailService: Failed to format email for ID: ' . $message->getId());
                    }
                } catch (\Exception $e) {
                    Log::error('GmailService: Error fetching message details for ID ' . $message->getId() . ': ' . $e->getMessage());
                }
            }

            Log::info('GmailService: Successfully retrieved ' . count($emails) . ' emails from inbox');
            return $emails;
        } catch (\Exception $e) {
            Log::error('Gmail API Error (Inbox): ' . $e->getMessage());
            Log::error('Gmail API Error (Inbox) Stack Trace: ' . $e->getTraceAsString());
            return $this->getMockData('inbox');
        }
    }

    /**
     * Get sent emails
     */
    public function getSentEmails($maxResults = 10, $dateQuery = null)
    {
        try {
            Log::info('GmailService: Fetching sent emails, maxResults: ' . $maxResults . ', dateQuery: ' . ($dateQuery ?? 'none'));
            
            $query = '-in:chats';
            if ($dateQuery) {
                $query .= ' ' . $dateQuery;
            }
            
            $optParams = [
                'maxResults' => $maxResults,
                'labelIds' => ['SENT'],
                'q' => $query
            ];

            Log::info('GmailService: Calling Gmail API for sent emails with params: ' . json_encode($optParams));
            $messages = $this->service->users_messages->listUsersMessages('me', $optParams);
            
            Log::info('GmailService: Retrieved ' . count($messages->getMessages()) . ' sent message IDs');
            
            $emails = [];

            foreach ($messages->getMessages() as $index => $message) {
                try {
                    Log::info('GmailService: Fetching sent message details for ID: ' . $message->getId() . ' (#' . ($index + 1) . ')');
                    $messageDetails = $this->service->users_messages->get('me', $message->getId());
                    $email = $this->formatEmailData($messageDetails, 'sent');
                    if ($email) {
                        $emails[] = $email;
                        Log::info('GmailService: Successfully formatted sent email: ' . $email['subject']);
                        // Debug the body content
                        Log::info('GmailService: Email body (first 100 chars): ' . substr($email['body'], 0, 100));
                        Log::info('GmailService: Email bodyHtml available: ' . ($email['bodyHtml'] ? 'YES' : 'NO'));
                        if ($email['bodyHtml']) {
                            Log::info('GmailService: Email bodyHtml (first 100 chars): ' . substr($email['bodyHtml'], 0, 100));
                        }
                    } else {
                        Log::warning('GmailService: Failed to format sent email for ID: ' . $message->getId());
                    }
                } catch (\Exception $e) {
                    Log::error('GmailService: Error fetching sent message details for ID ' . $message->getId() . ': ' . $e->getMessage());
                }
            }

            Log::info('GmailService: Successfully retrieved ' . count($emails) . ' emails from sent folder');
            return $emails;
        } catch (\Exception $e) {
            Log::error('Gmail API Error (Sent): ' . $e->getMessage());
            Log::error('Gmail API Error (Sent) Stack Trace: ' . $e->getTraceAsString());
            return $this->getMockData('sent');
        }
    }

    /**
     * Get draft emails
     */
    public function getDraftEmails($maxResults = 10)
    {
        try {
            $optParams = [
                'maxResults' => $maxResults
            ];

            $drafts = $this->service->users_drafts->listUsersDrafts('me', $optParams);
            $emails = [];

            foreach ($drafts->getDrafts() as $draft) {
                $draftDetails = $this->service->users_drafts->get('me', $draft->getId());
                $messageDetails = $draftDetails->getMessage();
                $email = $this->formatEmailData($messageDetails, 'draft');
                if ($email) {
                    $email['id'] = $draft->getId();
                    $emails[] = $email;
                }
            }

            return $emails;
        } catch (\Exception $e) {
            Log::error('Gmail API Error (Drafts): ' . $e->getMessage());
            return $this->getMockData('draft');
        }
    }

    /**
     * Get archive emails
     */
    public function getArchiveEmails($maxResults = 10, $dateQuery = null)
    {
        try {
            $query = '-in:inbox -in:sent -in:draft -in:spam -in:trash';
            if ($dateQuery) {
                $query .= ' ' . $dateQuery;
            }
            
            $optParams = [
                'maxResults' => $maxResults,
                'q' => $query
            ];

            $messages = $this->service->users_messages->listUsersMessages('me', $optParams);
            $emails = [];

            foreach ($messages->getMessages() as $message) {
                try {
                    $messageDetails = $this->service->users_messages->get('me', $message->getId());
                    $email = $this->formatEmailData($messageDetails, 'archive');
                    if ($email) {
                        $emails[] = $email;
                    }
                } catch (\Exception $e) {
                    Log::error('GmailService: Error fetching archive message details for ID ' . $message->getId() . ': ' . $e->getMessage());
                }
            }

            Log::info('GmailService: Successfully retrieved ' . count($emails) . ' emails from archive folder');
            return $emails;
        } catch (\Exception $e) {
            Log::error('Gmail API Error (Archive): ' . $e->getMessage());
            return $this->getMockData('archive');
        }
    }

    /**
     * Get deleted emails
     */
    public function getDeletedEmails($maxResults = 10)
    {
        try {
            $optParams = [
                'maxResults' => $maxResults,
                'labelIds' => ['TRASH'],
                'q' => '-in:chats'
            ];

            $messages = $this->service->users_messages->listUsersMessages('me', $optParams);
            $emails = [];

            foreach ($messages->getMessages() as $message) {
                try {
                    $messageDetails = $this->service->users_messages->get('me', $message->getId());
                    $email = $this->formatEmailData($messageDetails, 'deleted');
                    if ($email) {
                        $emails[] = $email;
                    }
                } catch (\Exception $e) {
                    Log::error('GmailService: Error fetching deleted message details for ID ' . $message->getId() . ': ' . $e->getMessage());
                }
            }

            Log::info('GmailService: Successfully retrieved ' . count($emails) . ' emails from deleted folder');
            return $emails;
        } catch (\Exception $e) {
            Log::error('Gmail API Error (Deleted): ' . $e->getMessage());
            return $this->getMockData('deleted');
        }
    }

    /**
     * Get spam emails
     */
    public function getSpamEmails($maxResults = 10, $dateQuery = null)
    {
        try {
            $query = '-in:chats';
            if ($dateQuery) {
                $query .= ' ' . $dateQuery;
            }
            
            $optParams = [
                'maxResults' => $maxResults,
                'labelIds' => ['SPAM'],
                'q' => $query
            ];

            $messages = $this->service->users_messages->listUsersMessages('me', $optParams);
            $emails = [];

            foreach ($messages->getMessages() as $message) {
                $messageDetails = $this->service->users_messages->get('me', $message->getId());
                $email = $this->formatEmailData($messageDetails, 'spam');
                if ($email) {
                    $emails[] = $email;
                }
            }

            return $emails;
        } catch (\Exception $e) {
            Log::error('Gmail API Error (Spam): ' . $e->getMessage());
            return $this->getMockData('spam');
        }
    }

    /**
     * Send email via Gmail
     */
    public function sendEmail($emailData)
    {
        try {
            Log::info('GmailService: sendEmail called with data: ' . json_encode([
                'to' => $emailData['to'],
                'subject' => $emailData['subject'],
                'attachmentCount' => count($emailData['attachments'] ?? [])
            ]));
            
            $message = new Google_Service_Gmail_Message();
            
            $rawMessage = $this->createRawMessage($emailData);
            $message->setRaw($rawMessage);

            Log::info('GmailService: Sending message to Gmail API...');
            $result = $this->service->users_messages->send('me', $message);
            
            Log::info('GmailService: Email sent successfully with ID: ' . $result->getId());
            
            return [
                'id' => $result->getId(),
                'threadId' => $result->getThreadId()
            ];
        } catch (\Exception $e) {
            Log::error('Gmail Send Error: ' . $e->getMessage());
            Log::error('Gmail Send Error Stack Trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Format email data from Gmail API response
     */
    private function formatEmailData($messageDetails, $folder)
    {
        try {
            $headers = $messageDetails->getPayload()->getHeaders();
            $subject = '';
            $from = '';
            $to = '';
            $date = '';

            foreach ($headers as $header) {
                switch ($header->getName()) {
                    case 'Subject':
                        $subject = $this->decodeHeader($header->getValue());
                        break;
                    case 'From':
                        $from = $this->decodeHeader($header->getValue());
                        break;
                    case 'To':
                        $to = $this->decodeHeader($header->getValue());
                        break;
                    case 'Date':
                        $date = $header->getValue();
                        break;
                }
            }

            // Extract email and name from "Name <email@domain.com>" format
            $fromName = $this->extractName($from);
            $fromEmail = $this->extractEmail($from);
            $toName = $this->extractName($to);
            $toEmail = $this->extractEmail($to);

            // Get message body (both text and html versions if available)
            $bodyParts = $this->getMessageBodyParts($messageDetails->getPayload());
            $bodyText = $this->normalizeUtf8($bodyParts['text'] ?? '');
            $bodyHtml = $this->normalizeUtf8($bodyParts['html'] ?? '');

            if (!$bodyText && $bodyHtml) {
                $bodyText = strip_tags($bodyHtml);
            }
            $bodyText = $this->normalizeUtf8(html_entity_decode($bodyText));
            $bodyHtmlSanitized = $this->sanitizeHtml($bodyHtml ?: nl2br(e($bodyText ?? '')));
            $bodyHtmlSanitized = $this->normalizeUtf8($bodyHtmlSanitized);

            // Check if message is read
            $labelIds = $messageDetails->getLabelIds() ?? [];
            $isRead = !in_array('UNREAD', $labelIds);

             // Check for attachments and collect metadata
             $attachments = $this->collectAttachments($messageDetails->getPayload());
             $hasAttachment = count($attachments) > 0;

            return [
                'id' => (string) $messageDetails->getId(),
                'threadId' => (string) $messageDetails->getThreadId(),
                'from' => $this->normalizeUtf8($fromName ?: $fromEmail),
                'fromEmail' => $this->normalizeUtf8($fromEmail),
                'to' => $this->normalizeUtf8($toName ?: $toEmail),
                'toEmail' => $this->normalizeUtf8($toEmail),
                'subject' => $this->normalizeUtf8($subject ?: '(No subject)'),
                'body' => $this->normalizeUtf8(strlen($bodyText) > 500 ? substr($bodyText, 0, 500) . '...' : $bodyText),
                'bodyHtml' => $bodyHtmlSanitized,
                'date' => $this->normalizeUtf8($this->formatDate($date)),
                'isRead' => $isRead,
                'isStarred' => in_array('STARRED', $labelIds),
                'hasAttachment' => $hasAttachment,
                'attachments' => $attachments,
                'priority' => $this->normalizeUtf8($this->determinePriority($subject, $from)),
                'folder' => $this->normalizeUtf8($folder)
            ];
        } catch (\Exception $e) {
            Log::error('Error formatting email data: ' . $e->getMessage());
            return null;
        }
    }

    private function decodeHeader($value)
    {
        if (!$value) return '';
        // Try mb_decode_mimeheader then iconv_mime_decode fallback
        $decoded = $value;
        if (function_exists('mb_decode_mimeheader')) {
            $decoded = @mb_decode_mimeheader($value);
        }
        if (!$decoded && function_exists('iconv_mime_decode')) {
            $decoded = @iconv_mime_decode($value, ICONV_MIME_DECODE_CONTINUE_ON_ERROR, 'UTF-8');
        }
        return $this->normalizeUtf8($decoded ?: $value);
    }

    private function normalizeUtf8($str)
    {
        if ($str === null) return '';
        if (!is_string($str)) $str = strval($str);
        // Remove invalid control characters except common whitespace
        $str = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $str);
        if (function_exists('mb_check_encoding') && !mb_check_encoding($str, 'UTF-8')) {
            // Try common encodings fallback
            $converted = @mb_convert_encoding($str, 'UTF-8', 'UTF-8,ISO-8859-1,Windows-1252');
            if ($converted !== false) {
                $str = $converted;
            }
        }
        // Strip any remaining invalid bytes
        $clean = @iconv('UTF-8', 'UTF-8//IGNORE', $str);
        return $clean !== false ? $clean : $str;
    }

    /**
     * Extract name from email header
     */
    private function extractName($emailHeader)
    {
        if (preg_match('/^([^<]+)<(.+)>$/', $emailHeader, $matches)) {
            return trim($matches[1], ' "');
        }
        return '';
    }

    /**
     * Extract email from email header
     */
    private function extractEmail($emailHeader)
    {
        if (preg_match('/<(.+)>/', $emailHeader, $matches)) {
            return $matches[1];
        }
        return $emailHeader;
    }

    /**
     * Get message body from payload
     */
    private function getMessageBodyParts($payload)
    {
        $result = ['text' => '', 'html' => ''];

        $decode = function ($data) {
            return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
        };

        $walkParts = function ($parts) use (&$walkParts, $decode, &$result) {
            foreach ($parts as $part) {
                $mime = $part->getMimeType();
                $body = $part->getBody();

                Log::info('GmailService: Processing part with MIME type: ' . $mime);

                if ($mime === 'text/plain' && $body && $body->getData()) {
                    $decodedText = $decode($body->getData());
                    $result['text'] .= $decodedText;
                    Log::info('GmailService: Found text/plain content (length: ' . strlen($decodedText) . ')');
                } elseif ($mime === 'text/html' && $body && $body->getData()) {
                    $decodedHtml = $decode($body->getData());
                    $result['html'] .= $decodedHtml;
                    Log::info('GmailService: Found text/html content (length: ' . strlen($decodedHtml) . ')');
                    Log::info('GmailService: HTML content preview: ' . substr($decodedHtml, 0, 200));
                }

                if ($part->getParts()) {
                    Log::info('GmailService: Part has sub-parts, walking deeper...');
                    $walkParts($part->getParts());
                }
            }
        };

        // Check main payload MIME type
        Log::info('GmailService: Main payload MIME type: ' . $payload->getMimeType());

        if ($payload->getBody() && $payload->getBody()->getData()) {
            // Check if main body is HTML
            if ($payload->getMimeType() === 'text/html') {
                $decodedHtml = $decode($payload->getBody()->getData());
                $result['html'] = $decodedHtml;
                Log::info('GmailService: Main body is HTML (length: ' . strlen($decodedHtml) . ')');
                Log::info('GmailService: Main HTML preview: ' . substr($decodedHtml, 0, 200));
            } else {
                // Fallback to plain text
                $decodedText = $decode($payload->getBody()->getData());
                $result['text'] = $decodedText;
                Log::info('GmailService: Main body is text (length: ' . strlen($decodedText) . ')');
            }
        }

        if ($payload->getParts()) {
            Log::info('GmailService: Payload has parts, walking through them...');
            $walkParts($payload->getParts());
        }

        Log::info('GmailService: Final result - Text length: ' . strlen($result['text']) . ', HTML length: ' . strlen($result['html']));

        return $result;
    }

    private function sanitizeHtml($html)
    {
        // Allow common tags and attributes; remove style/script/iframes entirely
        $html = preg_replace('/<(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\/\1>/i', '', $html);
        $allowedTags = '<p><br><b><strong><i><em><u><ul><ol><li><span><div><table><thead><tbody><tr><td><th><img><a><blockquote><pre><code>'; 
        $clean = strip_tags($html, $allowedTags);

        // Make links clickable and safe
        $clean = preg_replace_callback('/<a[^>]*href=\"([^\"]+)\"[^>]*>/', function ($m) {
            $href = htmlspecialchars($m[1], ENT_QUOTES);
            return '<a href="' . $href . '" target="_blank" rel="noopener noreferrer">';
        }, $clean);

        // Ensure images render properly with https and safe attrs
        $clean = preg_replace_callback('/<img[^>]*src=\"([^\"]+)\"[^>]*>/', function ($m) {
            $src = htmlspecialchars($m[1], ENT_QUOTES);
            if (strpos($src, 'http') !== 0) {
                $src = 'https://' . ltrim($src, '/');
            }
            return '<img src="' . $src . '" style="max-width:100%;height:auto;" alt="" />';
        }, $clean);

        return $clean;
    }

    /**
     * Check if message has attachments
     */
    private function hasAttachments($payload)
    {
        if ($payload->getParts()) {
            foreach ($payload->getParts() as $part) {
                if ($part->getFilename() && $part->getFilename() !== '') {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Collect attachment metadata from message parts
     */
    private function collectAttachments($payload)
    {
        $attachments = [];

        $walk = function ($parts) use (&$attachments, &$walk) {
            foreach ($parts as $part) {
                if ($part->getFilename()) {
                    $body = $part->getBody();
                    $attachId = $body ? $body->getAttachmentId() : null;
                    $attachments[] = [
                        'filename' => $this->normalizeUtf8($part->getFilename()),
                        'mimeType' => $part->getMimeType(),
                        'size' => $body ? $body->getSize() : null,
                        'attachmentId' => $attachId,
                        'partId' => $part->getPartId(),
                    ];
                }
                if ($part->getParts()) {
                    $walk($part->getParts());
                }
            }
        };

        if ($payload->getParts()) {
            $walk($payload->getParts());
        }

        return $attachments;
    }

    /**
     * Get attachment data as base64 for download
     */
    public function getAttachmentDataUrl($messageId, $attachmentId)
    {
        try {
            $attachment = $this->service->users_messages_attachments->get('me', $messageId, $attachmentId);
            $data = $attachment->getData();
            $binary = base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
            return base64_encode($binary);
        } catch (\Exception $e) {
            Log::error('Error getting attachment: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Format date for display
     */
    private function formatDate($dateString)
    {
        try {
            $date = Carbon::parse($dateString);
            return $date->format('Y-m-d H:i A');
        } catch (\Exception $e) {
            return date('Y-m-d H:i A');
        }
    }

    /**
     * Determine email priority based on subject and sender
     */
    private function determinePriority($subject, $from)
    {
        $subject = strtolower($subject);
        $from = strtolower($from);

        if (strpos($subject, 'urgent') !== false || strpos($subject, 'asap') !== false) {
            return 'urgent';
        }
        
        if (strpos($subject, 'important') !== false || strpos($subject, 'high priority') !== false) {
            return 'high';
        }

        return 'normal';
    }

    /**
     * Create raw message for sending
     */
    private function createRawMessage($emailData)
    {
        $to = $emailData['to'];
        $subject = $emailData['subject'];
        $body = $emailData['body'];
        $cc = $emailData['cc'] ?? '';
        $bcc = $emailData['bcc'] ?? '';
        $attachments = $emailData['attachments'] ?? [];

        Log::info('GmailService: createRawMessage - Processing ' . count($attachments) . ' attachments');
        
        if (!empty($attachments)) {
            foreach ($attachments as $index => $attachment) {
                Log::info('GmailService: Attachment ' . ($index + 1) . ': ' . json_encode([
                    'filename' => $attachment['filename'] ?? 'unknown',
                    'contentType' => $attachment['contentType'] ?? 'unknown',
                    'contentLength' => strlen($attachment['content'] ?? '')
                ]));
            }
        }

        $boundary = uniqid('boundary_');
        
        $message = "To: $to\r\n";
        if ($cc) $message .= "Cc: $cc\r\n";
        if ($bcc) $message .= "Bcc: $bcc\r\n";
        $message .= "Subject: $subject\r\n";
        $message .= "MIME-Version: 1.0\r\n";
        
        if (!empty($attachments)) {
            Log::info('GmailService: Creating multipart message with boundary: ' . $boundary);
            $message .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n\r\n";
            
            // Email body part
            $message .= "--$boundary\r\n";
            $message .= "Content-Type: text/html; charset=utf-8\r\n";
            $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
            $message .= $body . "\r\n\r\n";
            
            // Attachment parts
            foreach ($attachments as $index => $attachment) {
                Log::info('GmailService: Adding attachment ' . ($index + 1) . ' to message');
                $message .= "--$boundary\r\n";
                $message .= "Content-Type: " . ($attachment['contentType'] ?? 'application/octet-stream') . "\r\n";
                $message .= "Content-Disposition: attachment; filename=\"" . $attachment['filename'] . "\"\r\n";
                $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
                $message .= chunk_split($attachment['content'], 76, "\r\n");
                $message .= "\r\n";
            }
            
            $message .= "--$boundary--\r\n";
            Log::info('GmailService: Multipart message created successfully');
        } else {
            Log::info('GmailService: Creating simple message (no attachments)');
            $message .= "Content-Type: text/html; charset=utf-8\r\n\r\n";
            $message .= $body;
        }

        $encodedMessage = base64_encode($message);
        Log::info('GmailService: Raw message created, length: ' . strlen($encodedMessage));
        
        return $encodedMessage;
    }

    /**
     * Save email as draft
     */
    public function saveDraft($emailData)
    {
        try {
            Log::info('GmailService: Saving draft with data: ' . json_encode($emailData));
            
            $draft = new Google_Service_Gmail_Draft();
            $message = new Google_Service_Gmail_Message();
            
            $rawMessage = $this->createRawMessage($emailData);
            $message->setRaw($rawMessage);
            $draft->setMessage($message);

            $result = $this->service->users_drafts->create('me', $draft);
            
            Log::info('GmailService: Draft saved successfully with ID: ' . $result->getId());
            
            return [
                'id' => $result->getId(),
                'message' => $result->getMessage()
            ];
        } catch (\Exception $e) {
            Log::error('Gmail Save Draft Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Mark email as spam via Gmail API
     */
    public function markAsSpam($messageId)
    {
        try {
            Log::info('GmailService: Marking email as spam with ID: ' . $messageId);
            
            // Use Gmail API to modify labels - add SPAM label and remove INBOX label
            $modifyRequest = new Google_Service_Gmail_ModifyMessageRequest();
            $modifyRequest->setAddLabelIds(['SPAM']);
            $modifyRequest->setRemoveLabelIds(['INBOX']);
            
            $result = $this->service->users_messages->modify('me', $messageId, $modifyRequest);
            
            Log::info('GmailService: Email marked as spam successfully');
            
            return [
                'id' => $messageId,
                'markedAsSpam' => true,
                'labelIds' => $result->getLabelIds()
            ];
        } catch (\Exception $e) {
            Log::error('Gmail Mark As Spam Error: ' . $e->getMessage());
            Log::error('Gmail Mark As Spam Error Stack Trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Report email as not spam via Gmail API
     */
    public function reportNotSpam($messageId)
    {
        try {
            Log::info('GmailService: Reporting email as not spam with ID: ' . $messageId);
            
            // Use Gmail API to modify labels - remove SPAM label and add INBOX label
            $modifyRequest = new Google_Service_Gmail_ModifyMessageRequest();
            $modifyRequest->setAddLabelIds(['INBOX']);
            $modifyRequest->setRemoveLabelIds(['SPAM']);
            
            $result = $this->service->users_messages->modify('me', $messageId, $modifyRequest);
            
            Log::info('GmailService: Email reported as not spam successfully');
            
            return [
                'id' => $messageId,
                'reportedNotSpam' => true,
                'labelIds' => $result->getLabelIds()
            ];
        } catch (\Exception $e) {
            Log::error('Gmail Report Not Spam Error: ' . $e->getMessage());
            Log::error('Gmail Report Not Spam Error Stack Trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Archive email via Gmail API
     */
    public function archiveEmail($messageId)
    {
        try {
            Log::info('GmailService: Archiving email with ID: ' . $messageId);
            
            // Use Gmail API to modify labels - remove INBOX label to archive
            $modifyRequest = new Google_Service_Gmail_ModifyMessageRequest();
            $modifyRequest->setRemoveLabelIds(['INBOX']);
            
            $result = $this->service->users_messages->modify('me', $messageId, $modifyRequest);
            
            Log::info('GmailService: Email archived successfully');
            
            return [
                'id' => $messageId,
                'archived' => true,
                'labelIds' => $result->getLabelIds()
            ];
        } catch (\Exception $e) {
            Log::error('Gmail Archive Error: ' . $e->getMessage());
            Log::error('Gmail Archive Error Stack Trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Delete email via Gmail API
     */
    public function deleteEmail($messageId)
    {
        try {
            Log::info('GmailService: Deleting email with ID: ' . $messageId);
            
            // Use Gmail API to delete the message
            $this->service->users_messages->delete('me', $messageId);
            
            Log::info('GmailService: Email deleted successfully');
            
            return [
                'id' => $messageId,
                'deleted' => true
            ];
        } catch (\Exception $e) {
            Log::error('Gmail Delete Error: ' . $e->getMessage());
            Log::error('Gmail Delete Error Stack Trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Get mock data as fallback
     */
    private function getMockData($folder)
    {
        $mockData = [
            'inbox' => [
                [
                    'id' => 'mock_1',
                    'from' => 'John Smith',
                    'fromEmail' => 'john.smith@example.com',
                    'subject' => 'Project Update - Q4 Reports',
                    'body' => 'Hello team, I wanted to provide an update on our Q4 reports...',
                    'date' => date('Y-m-d H:i A'),
                    'isRead' => false,
                    'isStarred' => true,
                    'hasAttachment' => true,
                    'priority' => 'high'
                ]
            ],
            'sent' => [
                [
                    'id' => 'mock_2',
                    'to' => 'team@example.com',
                    'subject' => 'Weekly Status Report',
                    'body' => 'Please find attached this week\'s status report...',
                    'date' => date('Y-m-d H:i A'),
                    'isRead' => true,
                    'isStarred' => false,
                    'hasAttachment' => true,
                    'priority' => 'normal'
                ]
            ],
            'draft' => [
                [
                    'id' => 'mock_3',
                    'to' => 'client@example.com',
                    'subject' => 'Proposal Draft - Digital Transformation',
                    'body' => 'Dear Client, Thank you for your interest...',
                    'date' => date('Y-m-d H:i A'),
                    'isRead' => false,
                    'isStarred' => false,
                    'hasAttachment' => false,
                    'priority' => 'normal'
                ]
            ],
            'archive' => [
                [
                    'id' => 'mock_5',
                    'from' => 'Archive User',
                    'fromEmail' => 'archived@example.com',
                    'subject' => 'Archived Email - Old Project',
                    'body' => 'This is an archived email from an old project...',
                    'date' => date('Y-m-d H:i A', strtotime('-30 days')),
                    'isRead' => true,
                    'isStarred' => false,
                    'hasAttachment' => false,
                    'priority' => 'normal'
                ]
            ],
            'deleted' => [
                [
                    'id' => 'mock_6',
                    'from' => 'Deleted User',
                    'fromEmail' => 'deleted@example.com',
                    'subject' => 'Deleted Email - Old Message',
                    'body' => 'This email was deleted and is in trash...',
                    'date' => date('Y-m-d H:i A', strtotime('-7 days')),
                    'isRead' => true,
                    'isStarred' => false,
                    'hasAttachment' => false,
                    'priority' => 'normal'
                ]
            ],
            'spam' => [
                [
                    'id' => 'mock_4',
                    'from' => 'noreply@spam.com',
                    'subject' => 'You\'ve Won $1,000,000!',
                    'body' => 'Congratulations! You have been selected...',
                    'date' => date('Y-m-d H:i A'),
                    'isRead' => false,
                    'isStarred' => false,
                    'hasAttachment' => false,
                    'priority' => 'low'
                ]
            ]
        ];

        return $mockData[$folder] ?? [];
    }
}