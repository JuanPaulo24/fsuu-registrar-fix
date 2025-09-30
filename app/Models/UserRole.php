<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserRole extends Model
{
    use SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function posting()
    {
        return $this->hasMany(Posting::class, 'profile_id');
    }


}