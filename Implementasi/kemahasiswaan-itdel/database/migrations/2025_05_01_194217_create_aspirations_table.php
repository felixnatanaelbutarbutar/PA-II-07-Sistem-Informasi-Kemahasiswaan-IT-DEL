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
            $table->unsignedBigInteger('mpm_id'); // Kolom baru untuk foreign key ke mpms
            $table->text('story');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();

            $table->foreign('mpm_id')->references('id')->on('mpms')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('aspiration_categories')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('aspirations');
    }
};