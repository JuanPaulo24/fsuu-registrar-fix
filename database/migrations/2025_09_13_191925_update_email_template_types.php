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
        // First, update the enum constraint to include new template types
        DB::statement("ALTER TABLE email_templates MODIFY COLUMN template_type ENUM('verification_result', 'verification_result_success', 'verification_result_revoked', 'two_factor_auth', 'auto_reply', 'general') NOT NULL");

        // Update existing verification_result templates to the new success type
        DB::table('email_templates')
            ->where('template_type', 'verification_result')
            ->update(['template_type' => 'verification_result_success']);

        // Update existing general templates to verification_result_success as default
        DB::table('email_templates')
            ->where('template_type', 'general')
            ->update(['template_type' => 'verification_result_success']);

        // Finally, remove the old verification_result and general from enum
        DB::statement("ALTER TABLE email_templates MODIFY COLUMN template_type ENUM('verification_result_success', 'verification_result_revoked', 'two_factor_auth', 'auto_reply') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back the general and verification_result types temporarily
        DB::statement("ALTER TABLE email_templates MODIFY COLUMN template_type ENUM('verification_result', 'verification_result_success', 'verification_result_revoked', 'two_factor_auth', 'auto_reply', 'general') NOT NULL");
        
        // Revert verification_result_success back to verification_result
        DB::table('email_templates')
            ->where('template_type', 'verification_result_success')
            ->update(['template_type' => 'verification_result']);

        // Remove verification_result_revoked templates (they will be lost in rollback)
        DB::table('email_templates')
            ->where('template_type', 'verification_result_revoked')
            ->delete();

        // Revert the enum constraint to original values
        DB::statement("ALTER TABLE email_templates MODIFY COLUMN template_type ENUM('verification_result', 'two_factor_auth', 'auto_reply', 'general') NOT NULL");
    }
};