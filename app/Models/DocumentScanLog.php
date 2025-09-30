<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DocumentScanLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id_number',
        'document_type',
        'profile_id',
        'scan_status',
        'scan_result',
        'qr_data_hash',
        'scanner_ip',
        'user_agent',
        'scanned_by',
        'scanned_at'
    ];

    protected $casts = [
        'scan_result' => 'array',
        'scanned_at' => 'datetime'
    ];

    // Relationships
    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function scannedByUser()
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }

    // Scopes
    public function scopeSuccessful($query)
    {
        return $query->where('scan_status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->whereIn('scan_status', ['error', 'hash_mismatch', 'revoked']);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('scanned_at', '>=', now()->subDays($days));
    }

    // Helper methods
    public function isSuccessful()
    {
        return $this->scan_status === 'success';
    }

    public function getStatusColorAttribute()
    {
        return match($this->scan_status) {
            'success' => 'green',
            'revoked' => 'orange',
            'hash_mismatch' => 'red',
            'error' => 'red',
            default => 'gray'
        };
    }

    public function getStatusLabelAttribute()
    {
        return match($this->scan_status) {
            'success' => 'Verified',
            'revoked' => 'Revoked',
            'hash_mismatch' => 'Tampered',
            'error' => 'Error',
            default => 'Unknown'
        };
    }
}
