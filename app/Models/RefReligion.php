<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RefReligion extends Model
{
    use SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function religion()
    {
        return $this->hasMany(Profile::class, 'religion_id');
    }
}
