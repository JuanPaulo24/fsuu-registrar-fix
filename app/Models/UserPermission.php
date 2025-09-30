<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPermission extends Model
{
    use HasFactory, ModelTrait;

    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, "user_id");
    }

    public function module_button()
    {
        return $this->belongsTo(ModuleButton::class, "mod_button_id");
    }
}
