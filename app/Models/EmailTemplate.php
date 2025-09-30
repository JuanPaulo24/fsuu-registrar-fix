<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailTemplate extends Model
{
    use SoftDeletes, ModelTrait;

    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all attachments for the email template
     */
    public function attachments()
    {
        return $this->morphMany(\App\Models\Attachment::class, 'attachmentable');
    }

    /**
     * Get header images only
     */
    public function headerImages()
    {
        return $this->attachments()
            ->where('file_description', 'Header Image')
            ->where('file_type', 'image')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Get footer images only
     */
    public function footerImages()
    {
        return $this->attachments()
            ->where('file_description', 'Footer Image')
            ->where('file_type', 'image')
            ->orderBy('created_at', 'desc');
    }

    // Template types constants
    const TYPE_VERIFICATION_RESULT_SUCCESS = 'verification_result_success';
    const TYPE_VERIFICATION_RESULT_REVOKED = 'verification_result_revoked';
    const TYPE_TWO_FACTOR_AUTH = 'two_factor_auth';
    const TYPE_AUTO_REPLY = 'auto_reply';

    /**
     * Get all available template types
     */
    public static function getTemplateTypes()
    {
        return [
            self::TYPE_VERIFICATION_RESULT_SUCCESS => 'Verification Result (Success)',
            self::TYPE_VERIFICATION_RESULT_REVOKED => 'Verification Result (Revoked)',
            // self::TYPE_TWO_FACTOR_AUTH => 'Two-Factor Authentication',
            // self::TYPE_AUTO_REPLY => 'Auto-Reply',
        ];
    }

    /**
     * Scope to filter by template type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('template_type', $type);
    }

    /**
     * Scope to get active templates only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Generate complete email content with header, body, and footer
     */
    public function getCompleteContent($variables = [])
    {
        $content = '';
        
        if ($this->header) {
            $content .= $this->replaceVariables($this->header, $variables);
        }
        
        $content .= $this->replaceVariables($this->body, $variables);
        
        if ($this->footer) {
            $content .= $this->replaceVariables($this->footer, $variables);
        }
        
        return $content;
    }

    /**
     * Replace variables in template content
     */
    private function replaceVariables($content, $variables = [])
    {
        foreach ($variables as $key => $value) {
            $content = str_replace('[' . $key . ']', $value, $content);
        }
        
        return $content;
    }
}
