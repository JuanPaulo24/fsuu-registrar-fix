<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Traits\ModelTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, ModelTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'email',
        'email_verified_at',
        'username',
        'password',
        'user_role_id',
        'status',
        'one_time_update_info',
        'google2fa_enable',
        'google2fa_secret',
        'remember_token',
        'created_by',
        'updated_by',
        'deactivated_by',
        'deactivated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function profile()
    {
        return $this->hasOne(Profile::class, "user_id");
    }

    public function notification_users()
    {
        return $this->hasMany(NotificationUser::class, "user_id");
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachmentable');
    }

    public function userRole()
    {
        return $this->belongsTo(UserRole::class, 'user_role_id');
    }


    /**
     * Boot function for generating UUID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    /**
     * Find a user by UUID
     */
    public static function findByUuid($uuid)
    {
        return static::where('uuid', $uuid)->first();
    }
}