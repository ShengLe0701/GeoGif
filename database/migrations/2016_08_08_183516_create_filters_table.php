<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFiltersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::create('filters', function (Blueprint $table) {
          $table->increments('id');

          $table->string('name');
          $table->string('url');

          $table->string('start_date');
          $table->string('start_time');
          $table->string('end_date');
          $table->string('end_time');

          $table->integer('like');

          $table->string('locationid');

          $table->timestamps();

      });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
      Schema::drop('filters');
    }
}
