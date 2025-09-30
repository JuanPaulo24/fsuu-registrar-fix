<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceType extends Model
{
    use SoftDeletes, ModelTrait;

    protected $guarded = [];

        public function services()
        {
            return $this->hasMany(Service::class, "service_type_id");
        }

    public function account_code()
    {
        return $this->belongsTo(AccountCode::class, "account_code_id");
    }
}
