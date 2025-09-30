<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Auto-Reply Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for the automatic email reply
    | system. When emails are received to the specified email address, an
    | auto-reply will be sent using the configured template.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Auto-Reply Email Address
    |--------------------------------------------------------------------------
    |
    | The email address that will trigger auto-replies when emails are
    | received. Only emails sent TO this address will generate auto-replies.
    |
    */
    'email_address' => env('AUTO_REPLY_EMAIL', 'jburgers728@gmail.com'),

    /*
    |--------------------------------------------------------------------------
    | Auto-Reply Enabled
    |--------------------------------------------------------------------------
    |
    | Whether the auto-reply system is enabled. Set to false to disable
    | all auto-reply functionality.
    |
    */
    'enabled' => env('AUTO_REPLY_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Auto-Reply Rate Limiting
    |--------------------------------------------------------------------------
    |
    | To prevent spam and excessive auto-replies, the system will only send
    | one auto-reply per sender within the specified time period (in hours).
    |
    */
    'rate_limit_hours' => env('AUTO_REPLY_RATE_LIMIT_HOURS', 24),

    /*
    |--------------------------------------------------------------------------
    | Skip Auto-Reply Senders
    |--------------------------------------------------------------------------
    |
    | Email addresses or patterns that should not receive auto-replies.
    | Supports partial matching (e.g., 'noreply@' will match any email
    | containing that string).
    |
    */
    'skip_senders' => [
        'noreply@',
        'no-reply@',
        'donotreply@',
        'do-not-reply@',
        'mailer-daemon@',
        'postmaster@',
        'daemon@',
        'bounce@',
        'bounces@',
    ],

    /*
    |--------------------------------------------------------------------------
    | Auto-Reply Template Variables
    |--------------------------------------------------------------------------
    |
    | Default values for template variables that can be used in auto-reply
    | email templates. These can be overridden dynamically.
    |
    */
    'template_variables' => [
        'system:name' => 'Father Saturnino Urios University Office of the President Information System',
        'system:short_name' => 'FSUU OPIS',
        'contact:email' => 'jburgers728@gmail.com',
        'contact:phone' => '+63 XXX XXX XXXX',
        'office:hours' => 'Monday to Friday, 8:00 AM - 5:00 PM',
        'response:time' => '24-48 hours during business days',
    ],

    /*
    |--------------------------------------------------------------------------
    | Auto-Reply Job Delay
    |--------------------------------------------------------------------------
    |
    | Delay (in seconds) before processing auto-reply jobs. This ensures
    | the incoming email is fully processed before sending the auto-reply.
    |
    */
    'job_delay_seconds' => env('AUTO_REPLY_JOB_DELAY', 10),

    /*
    |--------------------------------------------------------------------------
    | Logging
    |--------------------------------------------------------------------------
    |
    | Whether to enable detailed logging for auto-reply operations.
    | Useful for debugging but may generate many log entries.
    |
    */
    'detailed_logging' => env('AUTO_REPLY_DETAILED_LOGGING', true),
];