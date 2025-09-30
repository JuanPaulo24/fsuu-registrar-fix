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
        Schema::table('module_buttons', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_button_id')->nullable()->after('module_id');
            $table->boolean('is_tab')->default(false)->after('mod_button_description');
            
            // Add foreign key constraint for parent-child relationship
            $table->foreign('parent_button_id')->references('id')->on('module_buttons')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('module_buttons', function (Blueprint $table) {
            $table->dropForeign(['parent_button_id']);
            $table->dropColumn(['parent_button_id', 'is_tab']);
        });
    }
};