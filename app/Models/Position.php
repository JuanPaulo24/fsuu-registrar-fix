<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\UserRole;

class Position extends Model
{
    use SoftDeletes;

    protected $table = 'positions';
    protected $guarded = [];

    public function user_role()
    {
        return $this->belongsTo(UserRole::class, 'user_role_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'position_id');
    }
}
