<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FSUUMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $emailData;
    public $templateType;
    public $recipientUserId;

    /**
     * Create a new message instance.
     */
    public function __construct($emailData = null, $templateType = 'default', $recipientUserId = null)
    {
        $this->emailData = $emailData;
        $this->templateType = $templateType;
        $this->recipientUserId = $recipientUserId;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->emailData['subject'] ?? 'FSUU Mail';
        
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.fsuu-mail',
            with: [
                'emailData' => $this->emailData,
                'templateType' => $this->templateType,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return $this->emailData['attachments'] ?? [];
    }

    /**
     * Handle the mailable after sending.
     */
    public function sent()
    {
        // Trigger real-time notification when email is sent
        if ($this->recipientUserId) {
            event(new \App\Events\EmailSent([
                'user_id' => $this->recipientUserId,
                'email_data' => $this->emailData,
                'template_type' => $this->templateType,
                'timestamp' => now()
            ]));
        }
    }

    /**
     * Handle the mailable before sending.
     */
    public function build()
    {
        return $this;
    }
}
