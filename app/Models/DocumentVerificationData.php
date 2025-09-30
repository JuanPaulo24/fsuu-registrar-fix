<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentVerificationData extends Model
{
    use SoftDeletes;

    protected $table = 'document_verification_data';

    protected $fillable = [
        'verification_hash',
        'base45_data',
        'created_by',
        'updated_by',
    ];

    /**
     * Get the user who created this verification data
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this verification data
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Generate a hash for the base45 data
     */
    public static function generateHash($base45Data)
    {
        return hash('sha256', $base45Data);
    }

    /**
     * Find verification data by hash
     */
    public static function findByHash($hash)
    {
        return static::where('verification_hash', $hash)->first();
    }
}
