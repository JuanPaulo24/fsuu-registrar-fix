<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProfileAddressesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('profile_addresses', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('profile_id')->nullable();
            $table->string('category')->nullable();
            $table->string('country')->nullable();
            $table->string('region')->nullable();
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('zip_code', 50)->nullable();
            $table->string('barangay')->nullable();
            $table->longText('address1')->nullable();
            $table->longText('address2')->nullable();
            $table->boolean('is_current_address')->default(0);
            $table->boolean('is_home_address')->default(0);
            $table->integer('status')->default(0);

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
        Schema::dropIfExists('profile_addresses');
    }
}
