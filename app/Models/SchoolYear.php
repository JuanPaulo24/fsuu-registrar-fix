<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SchoolYear extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];


    public function grade()
    {
        return $this->hasMany(Grade::class);
    }
}
