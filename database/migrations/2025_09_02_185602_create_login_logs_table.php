<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('login_logs', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable(); // User who attempted login
            $table->string('username')->nullable(); // Username/email used in attempt
            $table->string('ip_address')->nullable(); // IP address of the attempt
            $table->text('user_agent')->nullable(); // Browser/device information
            $table->string('status', 20)->default('FAILED'); // SUCCESS or FAILED
            $table->timestamp('attempted_at')->nullable(); // When the attempt occurred
            $table->text('failure_reason')->nullable(); // Reason for failure (if applicable)
            $table->timestamps();
            
            // Index for performance
            $table->index(['user_id', 'attempted_at']);
            $table->index(['status', 'attempted_at']);
            $table->index('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_logs');
    }
};
