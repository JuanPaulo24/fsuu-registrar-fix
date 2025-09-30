<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Posting extends Model
{
    use SoftDeletes, ModelTrait;

    protected $guarded = [];



    public function targetAudience()
    {
        return $this->belongsTo(UserRole::class, 'audience_id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
