<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountCode extends Model
{
    use SoftDeletes, ModelTrait;

    protected $guarded = [];

    public function payment_details()
    {
        return $this->hasMany(PaymentDetail::class, 'account_code_id');
    }

    public function parish()
    {
        return $this->belongsTo(Parish::class, 'parish_id');
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'account_code_id');
    }
}