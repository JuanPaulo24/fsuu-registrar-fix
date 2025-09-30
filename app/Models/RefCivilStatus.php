<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RefCivilStatus extends Model
{
    use SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function profiles()
    {
        return $this->hasMany(Profile::class, 'civil_status_id');
    }

}
