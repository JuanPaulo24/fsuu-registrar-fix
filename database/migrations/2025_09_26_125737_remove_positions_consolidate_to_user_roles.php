<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add UUID column to users table
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });

        // Generate UUIDs for existing users
        $users = DB::table('users')->whereNull('uuid')->get();
        foreach ($users as $user) {
            DB::table('users')->where('id', $user->id)->update([
                'uuid' => (string) \Illuminate\Support\Str::uuid()
            ]);
        }

        // Make UUID column unique and non-nullable
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->unique()->change();
        });

        // Remove position_id column from users table if it exists
        if (Schema::hasColumn('users', 'position_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('position_id');
            });
        }

        // Drop positions table
        Schema::dropIfExists('positions');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate positions table
        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->string('position_name')->nullable();
            $table->longText('description')->nullable();
            $table->integer('user_role_id')->nullable();
            
            $table->bigInteger('created_by')->nullable();
            $table->bigInteger('updated_by')->nullable();
            $table->bigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Add position_id column back to users table
        Schema::table('users', function (Blueprint $table) {
            $table->integer('position_id')->nullable()->after('user_role_id');
        });

        // Remove UUID column from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
