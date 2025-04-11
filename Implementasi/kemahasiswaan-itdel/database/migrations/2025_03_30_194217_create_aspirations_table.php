<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('aspirations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('requestBy')->nullable();
            $table->text('story');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();

            $table->foreign('requestBy')->references('id')->on('users')->onDelete('set null');
            $table->foreign('category_id')->references('id')->on('aspiration_categories')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('aspirations');
    }
};
