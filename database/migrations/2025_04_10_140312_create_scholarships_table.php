<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('scholarships', function (Blueprint $table) {
            $table->string('scholarship_id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('poster')->nullable();
            $table->date('start_date')->nullable(); // Use date or datetime
            $table->date('end_date')->nullable();   // Use date or datetime
            $table->string('category_id');
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->foreign('category_id')->references('category_id')->on('scholarship_categories');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarships');
    }
};
