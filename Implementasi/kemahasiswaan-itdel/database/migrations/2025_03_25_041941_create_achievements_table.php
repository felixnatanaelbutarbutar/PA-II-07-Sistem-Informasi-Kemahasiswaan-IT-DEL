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
            $table->string('achievement_type_id', 10); // Changed to match frontend
            $table->integer('rank')->nullable()->check('rank BETWEEN 1 AND 3');
            $table->enum('medal', ['Gold', 'Silver', 'Bronze'])->nullable();
            $table->string('event_name', 255);
            $table->date('event_date');
            $table->uuid('created_by')->nullable()->references('id')->on('users')->onDelete('SET NULL');
            $table->uuid('updated_by')->nullable()->references('id')->on('users')->onDelete('SET NULL');
            $table->timestamps();

            // Foreign key to achievement_types
            $table->foreign('achievement_type_id')->references('type_id')->on('achievement_types')->onDelete('RESTRICT');
        });
    }

    public function down()
    {
        Schema::dropIfExists('achievements');
    }
};