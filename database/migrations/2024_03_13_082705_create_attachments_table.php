<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAttachmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();

            $table->morphs('attachmentable');
            $table->string('file_name')->nullable();
            $table->longText('file_description')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_type')->default('other');
            $table->string('file_size')->nullable();
            $table->string('file_ext')->nullable();
            $table->string('file_type_origin')->nullable();

            $table->bigInteger('created_by')->nullable();
            $table->bigInteger('updated_by')->nullable();
            $table->bigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('attachments');
    }
}
