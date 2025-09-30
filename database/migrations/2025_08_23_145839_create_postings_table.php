
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
        Schema::create('postings', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('target_audience_id')->nullable();
            $table->string('title')->nullable();
            $table->string('type')->nullable();
            $table->longtext('content')->nullable();
            $table->string('priority_level')->nullable();
            $table->string('status')->nullable();
            $table->datetime('start_date')->nullable();
            $table->datetime('end_date')->nullable();

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
        Schema::dropIfExists('postings');
    }
};
