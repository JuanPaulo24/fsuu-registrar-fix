<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProfilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable();
            $table->bigInteger('course_id')->nullable();
            
            $table->string('id_number', 20)->nullable();
            $table->string('firstname', 100)->nullable();
            $table->string('middlename', 100)->nullable();
            $table->string('lastname', 100)->nullable();
            $table->longText('birthplace')->nullable();
            $table->string('name_ext', 50)->nullable();
            $table->string('citizenship', 100)->nullable();
            $table->string('religion', 100)->nullable();
            $table->string('civil_status', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('spouse_name')->nullable();
            $table->string('course')->nullable();
            $table->string('elem_school')->nullable();
            $table->string('elem_lastyearattened')->nullable();
            $table->string('junior_high_school')->nullable();
            $table->string('junior_high_school_lastyearattened')->nullable();
            $table->string('senior_high_school')->nullable();
            $table->string('senior_high_school_lastyearattened')->nullable();
            $table->string('gender')->nullable();
            $table->date('birthdate')->nullable();



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
        Schema::dropIfExists('profiles');
    }
}
