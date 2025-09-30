# Auto-Reply System Setup Guide

This guide explains how to set up and use the automatic email reply system in FSUU OPIS.

## Overview

The auto-reply system automatically sends a response email when someone emails `jburgers728@gmail.com`. It works through the Laravel queue system and doesn't require the browser to be open.

## How It Works

1. **Email Monitoring**: The `CheckNewEmails` job runs periodically (via `queue:work`)
2. **Auto-Reply Detection**: When a new email is received to `jburgers728@gmail.com`, it triggers auto-reply
3. **Template Processing**: The system uses the "Auto-Reply" email template
4. **Smart Sending**: Auto-replies are sent with rate limiting to prevent spam

## Setup Steps

### 1. Configure Environment Variables

Add these to your `.env` file:

```env
# Auto-Reply Configuration
AUTO_REPLY_ENABLED=true
AUTO_REPLY_EMAIL=jburgers728@gmail.com
AUTO_REPLY_RATE_LIMIT_HOURS=24
AUTO_REPLY_JOB_DELAY=10
AUTO_REPLY_DETAILED_LOGGING=true
```

### 2. Create Auto-Reply Email Template

1. Go to **Email Templates** in the admin panel
2. Create a new template with type **"Auto-Reply"**
3. Set it as **Active**
4. Use template variables like:
   - `[user:name]` - Sender's name
   - `[user:account]` - Sender's email
   - `[message:reference]` - Unique reference number
   - `[message:date]` - Current date/time
   - `[system:name]` - System name from config

### 3. Start Queue Worker

The auto-reply system requires the queue worker to be running:

```bash
php artisan queue:work
```

For production, use a process manager like Supervisor to keep it running.

### 4. Test the System

Test with the command:

```bash
php artisan email:test-auto-reply --sender-email=test@example.com --sender-name="Test User"
```

## Features

### ✅ **Rate Limiting**
- Only sends one auto-reply per sender within 24 hours (configurable)
- Prevents spam and excessive replies

### ✅ **Smart Filtering**
- Skips system emails (noreply@, mailer-daemon@, etc.)
- Won't reply to your own emails
- Only replies to emails sent TO the configured address

### ✅ **Template Integration**
- Uses your configured email template
- Supports header/footer banners
- Dynamic variable replacement

### ✅ **Logging**
- Detailed logs for debugging
- Tracks all auto-reply activities
- Error handling and reporting

## Configuration Options

Edit `config/auto_reply.php` to customize:

- **Email Address**: Which address triggers auto-replies
- **Rate Limiting**: How often to send auto-replies to same sender
- **Skip Patterns**: Email patterns to ignore
- **Template Variables**: Default values for templates
- **Job Delay**: Delay before processing auto-replies

## Monitoring

### Check Logs
```bash
tail -f storage/logs/laravel.log | grep "🤖\|📧"
```

### Queue Status
```bash
php artisan queue:work --verbose
```

### Cache Status
Check if rate limiting is working:
```bash
php artisan tinker
>>> Cache::get('auto_reply_sent_to_' . md5('test@example.com'))
```

## Troubleshooting

### Auto-Reply Not Working

1. **Check if enabled**: `AUTO_REPLY_ENABLED=true` in `.env`
2. **Check queue worker**: Make sure `php artisan queue:work` is running
3. **Check template**: Ensure "Auto-Reply" template exists and is active
4. **Check logs**: Look for 🤖 and 📧 emojis in logs
5. **Check Gmail service**: Ensure Gmail API is configured

### Too Many Auto-Replies

1. **Check rate limiting**: Increase `AUTO_REPLY_RATE_LIMIT_HOURS`
2. **Check skip patterns**: Add more patterns to `skip_senders` in config
3. **Clear cache**: `php artisan cache:clear`

### Gmail API Issues

1. **Check credentials**: Ensure Gmail API tokens are valid
2. **Check scopes**: Ensure `GMAIL_SEND` scope is enabled
3. **Fallback**: System will use Laravel Mail if Gmail API fails

## Production Deployment

### 1. Supervisor Configuration

Create `/etc/supervisor/conf.d/fsuu-queue.conf`:

```ini
[program:fsuu-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/fsuu_registrar/artisan queue:work --sleep=3 --tries=3 --max-time=3600
directory=/path/to/fsuu_registrar
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/fsuu_registrar/storage/logs/queue.log
stopwaitsecs=3600
```

### 2. Start Services

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start fsuu-queue:*
```

### 3. Monitor

```bash
sudo supervisorctl status fsuu-queue:*
```

## Security Considerations

- ✅ Rate limiting prevents spam
- ✅ Sender filtering prevents loops
- ✅ Template variables are escaped
- ✅ Only responds to specific email address
- ✅ Detailed logging for audit trail

## Support

If you encounter issues:

1. Check the logs: `storage/logs/laravel.log`
2. Test with: `php artisan email:test-auto-reply`
3. Verify queue is running: `php artisan queue:work --verbose`
4. Check Gmail API status in admin panel