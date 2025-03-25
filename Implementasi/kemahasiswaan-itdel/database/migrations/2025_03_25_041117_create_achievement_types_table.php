<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('achievement_types', function (Blueprint $table) {
            $table->string('type_id', 10)->primary();
            $table->string('type_name', 100)->unique();
            $table->text('description');
            $table->uuid('created_by')->nullable()->references('id')->on('users')->onDelete('SET NULL');
            $table->uuid('updated_by')->nullable()->references('id')->on('users')->onDelete('SET NULL');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('achievement_types');
    }
};
