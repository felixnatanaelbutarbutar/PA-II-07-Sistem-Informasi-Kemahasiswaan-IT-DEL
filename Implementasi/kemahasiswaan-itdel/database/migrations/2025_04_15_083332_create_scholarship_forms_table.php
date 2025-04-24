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
        Schema::create('scholarship_forms', function (Blueprint $table) {
            $table->string('form_id', 10)->primary(); // ID dengan format SF001
            $table->string('scholarship_id', 10); // Mengacu ke scholarships
            $table->string('form_name', 100); // Nama formulir
            $table->text('description')->nullable(); // Deskripsi formulir
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by'); // Pembuat formulir
            $table->unsignedBigInteger('updated_by')->nullable(); // Pengubah formulir
            $table->timestamps();

            // Foreign keys
            $table->foreign('scholarship_id')->references('scholarship_id')->on('scholarships')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null'); // Changed to 'set null' for updated_by
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarship_forms');
    }
};
