<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicScanHistory extends Model
{
    use HasFactory;

    protected $table = 'public_scan_history';

    protected $fillable = [
        'email',
        'serial_number',
        'document_type',
        'student_name',
        'student_id',
        'ip_address',
        'user_agent',
        'scan_status',
        'failure_reason',
        'email_sent',
        'scanned_at'
    ];

    protected $casts = [
        'email_sent' => 'boolean',
        'scanned_at' => 'datetime',
    ];

    /**
     * Scope for successful scans
     */
    public function scopeSuccessful($query)
    {
        return $query->where('scan_status', 'success');
    }

    /**
     * Scope for failed scans
     */
    public function scopeFailed($query)
    {
        return $query->where('scan_status', 'failed');
    }

    /**
     * Scope for revoked document scans
     */
    public function scopeRevoked($query)
    {
        return $query->where('scan_status', 'revoked');
    }

    /**
     * Get browser name from user agent
     */
    public function getBrowserAttribute()
    {
        $userAgent = $this->user_agent;
        
        if (strpos($userAgent, 'Chrome') !== false) {
            return 'Chrome';
        } elseif (strpos($userAgent, 'Firefox') !== false) {
            return 'Firefox';
        } elseif (strpos($userAgent, 'Safari') !== false) {
            return 'Safari';
        } elseif (strpos($userAgent, 'Edge') !== false) {
            return 'Edge';
        } elseif (strpos($userAgent, 'Opera') !== false) {
            return 'Opera';
        } else {
            return 'Unknown';
        }
    }

    /**
     * Get device type from user agent
     */
    public function getDeviceAttribute()
    {
        $userAgent = $this->user_agent;
        
        if (strpos($userAgent, 'Mobile') !== false || strpos($userAgent, 'Android') !== false) {
            return 'Mobile';
        } elseif (strpos($userAgent, 'Tablet') !== false || strpos($userAgent, 'iPad') !== false) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }
}