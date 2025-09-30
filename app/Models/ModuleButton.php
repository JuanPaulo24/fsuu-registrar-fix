<?php

namespace App\Models;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModuleButton extends Model
{
    use ModelTrait;

    protected $guarded = [];

    public function module()
    {
        return $this->belongsTo(Module::class, "module_id");
    }

    public function user_role_permissions()
    {
        return $this->hasMany(UserRolePermission::class, "mod_button_id");
    }

    public function parent()
    {
        return $this->belongsTo(ModuleButton::class, 'parent_button_id');
    }

    public function children()
    {
        return $this->hasMany(ModuleButton::class, 'parent_button_id');
    }
}