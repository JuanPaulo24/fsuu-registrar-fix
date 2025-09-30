<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProfileAddress extends Model
{
    use  SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function profile()
    {
        return $this->belongsTo(Profile::class, "profile_id");
    }
}