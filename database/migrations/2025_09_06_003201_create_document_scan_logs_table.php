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
        Schema::create('document_scan_logs', function (Blueprint $table) {
            $table->id();
            $table->string('document_id_number')->nullable(); // Document ID from QR
            $table->string('document_type')->nullable(); // TOR, DIP, etc.
            $table->bigInteger('profile_id')->nullable(); // Profile that was scanned
            $table->string('scan_status'); // success, error, revoked, hash_mismatch
            $table->text('scan_result')->nullable(); // JSON result or error message
            $table->text('qr_data_hash')->nullable(); // Hash of QR data for tracking
            $table->string('scanner_ip')->nullable(); // IP address of scanner
            $table->string('user_agent')->nullable(); // Browser info
            $table->bigInteger('scanned_by')->nullable(); // User who performed the scan
            $table->timestamp('scanned_at'); // When the scan occurred
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('document_id_number');
            $table->index('scan_status');
            $table->index('scanned_at');
            $table->index('profile_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_scan_logs');
    }
};
