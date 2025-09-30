<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Profile extends Model
{
    use HasFactory, SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, "user_id");
    }

    public function civil_status()
    {
        return $this->belongsTo(RefCivilStatus::class, "civil_status_id");
    }

    public function citizenship()
    {
        return $this->belongsTo(RefCitizenship::class, "citizenship_id");
    }

    public function religion()
    {
        return $this->belongsTo(RefReligion::class, "religion_id");
    }

   
    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachmentable');
    }
        public function grade()
    {
        return $this->hasOne(Grade::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }


    public function issuedDocument()
    {
        return $this->hasMany(IssuedDocument::class);
    }

    // Accessor for fullname
    public function getFullnameAttribute()
    {
        $fullname = trim($this->firstname . ' ' . $this->lastname);
        return !empty($fullname) ? $fullname : null;
    }

    public function courseInfo()
    {
        return $this->belongsTo(\App\Models\Course::class, 'course_id');
    }
}
