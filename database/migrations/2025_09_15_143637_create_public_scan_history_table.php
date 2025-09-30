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
        Schema::create('public_scan_history', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('serial_number');
            $table->string('document_type');
            $table->string('student_name');
            $table->string('student_id')->nullable();
            $table->ipAddress('ip_address');
            $table->text('user_agent'); // Browser and device info
            $table->enum('scan_status', ['success', 'failed', 'revoked'])->default('failed');
            $table->string('failure_reason')->nullable();
            $table->boolean('email_sent')->default(false);
            $table->timestamp('scanned_at');
            $table->timestamps();

            // Indexes for better performance
            $table->index('email');
            $table->index('document_type');
            $table->index('scan_status');
            $table->index('scanned_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('public_scan_history');
    }
};