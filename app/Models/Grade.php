<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Grade extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function documentGrade()
    {
        return $this->hasMany(DocumentGrade::class);
    }
}
