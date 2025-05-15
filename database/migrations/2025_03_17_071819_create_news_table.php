<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('news', function (Blueprint $table) {
            $table->string('news_id', 10)->primary();
            $table->string('title', 255);
            $table->string('image', 255)->nullable();
            $table->text('content');
            $table->string('category_id', 10);
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('category_id')->references('category_id')->on('news_categories')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('news');
    }
};
