<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RefBarangay extends Model
{
    use ModelTrait, SoftDeletes;

    protected $guarded = [];

    public function city()
    {
        return $this->belongsTo(RefCity::class, 'city_id');
    }

    public function scopeFilter($query, $request)
    {
        if ($request->city_id) {
            $query->where('city_id', $request->city_id);
        }

        return $query;
    }
}