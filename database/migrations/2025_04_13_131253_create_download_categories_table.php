<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDownloadCategoriesTable extends Migration
{
    public function up()
    {
        Schema::create('download_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique()->index();
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('download_categories');
    }
}