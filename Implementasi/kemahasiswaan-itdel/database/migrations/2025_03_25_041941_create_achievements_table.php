<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->string('achievement_id', 10)->primary();
            $table->string('title', 255);
            $table->text('description');
            $table->enum('category', ['International', 'National', 'Regional']);
            $table->string('achievement_type_id', 10);
            $table->enum('medal', ['Gold', 'Silver', 'Bronze'])->nullable();
            $table->string('event_name', 255);
            $table->date('event_date');
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('achievement_type_id')->references('type_id')->on('achievement_types')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('achievements');
    }
};
