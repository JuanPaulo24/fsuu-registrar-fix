<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attachment extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'image_dimensions' => 'array',
    ];

    public function attachmentable()
    {
        return $this->morphTo();
    }

    /**
     * Get image dimensions as width x height string
     */
    public function getDimensionsStringAttribute()
    {
        if ($this->image_dimensions && isset($this->image_dimensions['width'], $this->image_dimensions['height'])) {
            return $this->image_dimensions['width'] . ' × ' . $this->image_dimensions['height'] . 'px';
        }
        return null;
    }
}