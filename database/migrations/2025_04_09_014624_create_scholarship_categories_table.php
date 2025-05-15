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
        Schema::create('scholarship_categories', function (Blueprint $table) {
            $table->string('category_id', 10)->primary();
            $table->string('category_name', 100)->unique();
            $table->text('description');
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by'); // Mengarah ke id di tabel users
            $table->unsignedBigInteger('updated_by')->nullable(); // Mengarah ke id di tabel users, boleh kosong
            $table->timestamps();

            // Foreign keys
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarship_categories');
    }
};
