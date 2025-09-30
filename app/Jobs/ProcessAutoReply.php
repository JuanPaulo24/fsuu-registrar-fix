<?php

namespace App\Jobs;

use App\Models\EmailTemplate;
use App\Services\GmailService;
use App\Mail\FSUUMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class ProcessAutoReply implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $incomingEmail;
    protected $userId;

    /**
     * Create a new job instance.
     */
    public function __construct($incomingEmail, $userId = 1)
    {
        $this->incomingEmail = $incomingEmail;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Check if auto-reply is enabled
            if (!config('auto_reply.enabled', true)) {
                Log::info('🤖 Auto-reply is disabled in configuration. Skipping.');
                return;
            }

            if (config('auto_reply.detailed_logging', true)) {
                Log::info('🤖 Processing auto-reply for email ID: ' . $this->incomingEmail['id']);
            }

            // Check if we already sent an auto-reply to this sender recently
            $senderEmail = $this->incomingEmail['fromEmail'] ?? $this->incomingEmail['from'];
            $rateLimitHours = config('auto_reply.rate_limit_hours', 24);
            $cacheKey = "auto_reply_sent_to_" . md5($senderEmail);
            
            if (Cache::has($cacheKey)) {
                if (config('auto_reply.detailed_logging', true)) {
                    Log::info("🤖 Auto-reply already sent to {$senderEmail} within {$rateLimitHours} hours. Skipping.");
                }
                return;
            }

            // Get the auto-reply email template
            $autoReplyTemplate = EmailTemplate::where('template_type', 'auto_reply')
                ->where('system_id', 3)
                ->where('is_active', true)
                ->first();

            if (!$autoReplyTemplate) {
                Log::warning('🤖 No active auto-reply template found. Skipping auto-reply.');
                return;
            }

            // Extract sender name from email header
            $senderName = $this->extractNameFromEmail($this->incomingEmail['from']);
            
            // Prepare template variables
            $configVariables = config('auto_reply.template_variables', []);
            $templateVariables = array_merge($configVariables, [
                'user:name' => $senderName ?: 'Valued User',
                'user:account' => $senderEmail,
                'message:reference' => 'AUTO-' . date('YmdHis') . '-' . substr(md5($this->incomingEmail['id']), 0, 6),
                'message:date' => date('Y-m-d H:i A'),
                'system:date' => date('Y-m-d'),
                'system:time' => date('H:i A')
            ]);

            // Build email body with template variables
            $emailBody = $this->buildEmailBodyWithBanners($autoReplyTemplate, $templateVariables);

            // Prepare auto-reply email data
            $autoReplyData = [
                'to' => $senderEmail,
                'subject' => $autoReplyTemplate->subject,
                'body' => $emailBody,
                'template_type' => 'auto_reply',
                'recipient_user_id' => $this->userId
            ];

            // Send auto-reply via Gmail
            $gmailService = app(GmailService::class);
            
            if ($gmailService->isReady()) {
                $result = $gmailService->sendEmail($autoReplyData);
                
                Log::info('🤖 Auto-reply sent successfully via Gmail API', [
                    'to' => $senderEmail,
                    'gmail_id' => $result['id'],
                    'template_id' => $autoReplyTemplate->id
                ]);

                // Cache that we sent auto-reply to prevent duplicates
                $rateLimitHours = config('auto_reply.rate_limit_hours', 24);
                Cache::put($cacheKey, true, now()->addHours($rateLimitHours));

                // Dispatch EmailSent event for real-time notification
                event(new \App\Events\EmailSent([
                    'user_id' => $this->userId,
                    'email_data' => [
                        'to' => $senderEmail,
                        'subject' => $autoReplyTemplate->subject,
                        'id' => $result['id'],
                        'threadId' => $result['threadId'],
                        'type' => 'auto_reply'
                    ],
                    'timestamp' => now()
                ]));

            } else {
                // Fallback to Laravel Mail if Gmail service is not available
                Log::warning('🤖 Gmail service not ready, using Laravel Mail as fallback');
                
                Mail::to($senderEmail)->send(new FSUUMail($autoReplyData, 'auto_reply', $this->userId));
                
                Log::info('🤖 Auto-reply sent successfully via Laravel Mail', [
                    'to' => $senderEmail,
                    'template_id' => $autoReplyTemplate->id
                ]);

                // Cache that we sent auto-reply
                $rateLimitHours = config('auto_reply.rate_limit_hours', 24);
                Cache::put($cacheKey, true, now()->addHours($rateLimitHours));
            }

        } catch (\Exception $e) {
            Log::error('🤖 Error processing auto-reply: ' . $e->getMessage(), [
                'email_id' => $this->incomingEmail['id'] ?? 'unknown',
                'stack_trace' => $e->getTraceAsString()
            ]);
            
            // Don't fail the job, just log the error
            // This prevents the job from being retried unnecessarily
        }
    }

    /**
     * Extract name from email address or header
     */
    private function extractNameFromEmail($fromHeader)
    {
        // Try to extract name from "Name <email@domain.com>" format
        if (preg_match('/^([^<]+)<(.+)>$/', $fromHeader, $matches)) {
            return trim($matches[1], ' "');
        }
        
        // If no name found, try to create a friendly name from email
        if (preg_match('/([^@]+)@/', $fromHeader, $matches)) {
            $username = $matches[1];
            // Convert dots/underscores to spaces and capitalize
            $name = ucwords(str_replace(['.', '_', '-'], ' ', $username));
            return $name;
        }
        
        return null;
    }

    /**
     * Build email body with header/footer banners and template variables
     */
    private function buildEmailBodyWithBanners($template, $variables)
    {
        try {
            // Get header and footer images
            $headerImages = $template->headerImages;
            $footerImages = $template->footerImages;

            $body = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: transparent;">';
            
            // Add header images
            if ($headerImages && $headerImages->count() > 0) {
                $body .= '<div style="text-align: center; margin-bottom: 20px;">';
                foreach ($headerImages as $image) {
                    $base64Image = $this->getImageAsBase64($image->file_path);
                    if ($base64Image) {
                        $dimensions = $image->image_dimensions;
                        $width = isset($dimensions['width']) ? $dimensions['width'] . 'px' : '100%';
                        $height = isset($dimensions['height']) ? $dimensions['height'] . 'px' : 'auto';
                        
                        $body .= '<img src="' . $base64Image . '" alt="Header Banner" style="';
                        $body .= 'width: ' . $width . '; ';
                        $body .= 'height: ' . $height . '; ';
                        $body .= 'object-fit: contain; ';
                        $body .= 'background-color: transparent; ';
                        $body .= 'display: inline-block; ';
                        $body .= 'margin-bottom: 8px;';
                        $body .= '" />';
                    }
                }
                $body .= '</div>';
            }
            
            // Add main content with variable replacement
            $processedBody = $template->body;
            foreach ($variables as $variable => $value) {
                $processedBody = str_replace('[' . $variable . ']', $value, $processedBody);
            }
            $body .= $processedBody;

            // Add footer images
            if ($footerImages && $footerImages->count() > 0) {
                $body .= '<div style="text-align: center; margin-top: 20px;">';
                foreach ($footerImages as $image) {
                    $base64Image = $this->getImageAsBase64($image->file_path);
                    if ($base64Image) {
                        $dimensions = $image->image_dimensions;
                        $width = isset($dimensions['width']) ? $dimensions['width'] . 'px' : '100%';
                        $height = isset($dimensions['height']) ? $dimensions['height'] . 'px' : 'auto';
                        
                        $body .= '<img src="' . $base64Image . '" alt="Footer Banner" style="';
                        $body .= 'width: ' . $width . '; ';
                        $body .= 'height: ' . $height . '; ';
                        $body .= 'object-fit: contain; ';
                        $body .= 'background-color: transparent; ';
                        $body .= 'display: inline-block; ';
                        $body .= 'margin-bottom: 8px;';
                        $body .= '" />';
                    }
                }
                $body .= '</div>';
            }
            
            $body .= '</div>';
            return $body;

        } catch (\Exception $e) {
            Log::error('🤖 Error building email body with banners: ' . $e->getMessage());
            // Return template body with variables replaced as fallback
            $processedBody = $template->body;
            foreach ($variables as $variable => $value) {
                $processedBody = str_replace('[' . $variable . ']', $value, $processedBody);
            }
            return $processedBody;
        }
    }

    /**
     * Convert image file to base64 data URL for embedding in emails
     */
    private function getImageAsBase64($filePath)
    {
        try {
            // Remove 'storage/' prefix if present and get the actual file path
            $actualPath = str_replace('storage/', '', $filePath);
            $fullPath = storage_path('app/public/' . $actualPath);
            
            // Check if file exists
            if (!file_exists($fullPath)) {
                Log::warning('🤖 Image file not found for auto-reply: ' . $fullPath);
                return null;
            }
            
            // Get file contents and MIME type
            $imageData = file_get_contents($fullPath);
            $mimeType = mime_content_type($fullPath);
            
            if (!$imageData) {
                Log::warning('🤖 Could not read image file: ' . $fullPath);
                return null;
            }
            
            // Convert to base64 and create data URL
            $base64 = base64_encode($imageData);
            return 'data:' . $mimeType . ';base64,' . $base64;
            
        } catch (\Exception $e) {
            Log::error('🤖 Error converting image to base64: ' . $e->getMessage());
            return null;
        }
    }
}