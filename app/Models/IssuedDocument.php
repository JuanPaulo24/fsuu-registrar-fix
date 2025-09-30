<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IssuedDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function documentGrade()
    {
        return $this->hasMany(DocumentGrade::class);
    }

    public function signature()
    {
        return $this->belongsTo(Signature::class);
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachmentable');
    }


    
}
