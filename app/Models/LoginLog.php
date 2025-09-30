<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    use ModelTrait;

    protected $guarded = [];

    protected $casts = [
        'attempted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Helper method to get device info from user agent
    public function getDeviceAttribute()
    {
        if (!$this->user_agent) return 'Unknown Device';
        
        // Simple device detection
        $userAgent = $this->user_agent;
        $device = 'Unknown';
        $browser = 'Unknown';
        
        // Detect OS
        if (preg_match('/Windows NT/i', $userAgent)) {
            $device = 'Windows';
        } elseif (preg_match('/Mac OS X/i', $userAgent)) {
            $device = 'macOS';
        } elseif (preg_match('/Android/i', $userAgent)) {
            $device = 'Android';
        } elseif (preg_match('/iPhone|iPad/i', $userAgent)) {
            $device = preg_match('/iPad/i', $userAgent) ? 'iPad' : 'iPhone';
        } elseif (preg_match('/Linux/i', $userAgent)) {
            $device = 'Linux';
        }
        
        // Detect Browser
        if (preg_match('/Chrome/i', $userAgent) && !preg_match('/Edge/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/Firefox/i', $userAgent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/Safari/i', $userAgent) && !preg_match('/Chrome/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/Edge/i', $userAgent)) {
            $browser = 'Edge';
        }
        
        return $device . ' - ' . $browser;
    }
}
