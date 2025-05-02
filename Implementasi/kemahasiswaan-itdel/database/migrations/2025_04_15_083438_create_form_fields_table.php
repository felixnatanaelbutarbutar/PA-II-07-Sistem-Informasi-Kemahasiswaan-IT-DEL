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
        // database/migrations/xxxx_xx_xx_create_form_fields_table.php
        Schema::create('form_fields', function (Blueprint $table) {
            $table->string('field_id', 10)->primary();
            $table->string('form_id', 10);
            $table->string('section_title', 100);
            $table->string('field_name', 100);
            $table->string('field_type', 50);
            $table->boolean('is_required')->default(false); // Changed to boolean
            $table->text('options')->nullable();
            $table->string('order', 3)->default('0');
            $table->string('file_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('form_id')->references('form_id')->on('scholarship_forms')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};
