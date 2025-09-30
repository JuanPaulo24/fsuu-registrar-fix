<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRolePermission extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function module_button()
    {
        return $this->belongsTo(ModuleButton::class, "mod_button_id");
    }
}
