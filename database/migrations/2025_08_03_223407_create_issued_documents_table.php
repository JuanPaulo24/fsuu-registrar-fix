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
        Schema::create('issued_documents', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('profile_id')->nullable();
            $table->bigInteger('registrar_id')->nullable();
            $table->bigInteger('signature_id')->nullable();

            $table->string('document_type')->nullable();
            $table->longtext('pdf_hash')->nullable();
            $table->longtext('signature_hash')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('document_id_number')->nullable();
            $table->float('current_version')->nullable();

            $table->datetime('date_issued')->nullable();
            $table->datetime('date_revoked')->nullable();

            $table->bigInteger('created_by')->nullable();
            $table->bigInteger('updated_by')->nullable();
            $table->bigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issued_documents');
    }
};
