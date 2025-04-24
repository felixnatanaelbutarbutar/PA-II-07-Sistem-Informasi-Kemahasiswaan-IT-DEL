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
        Schema::create('form_fields', function (Blueprint $table) {
            $table->string('field_id', 10)->primary(); // ID dengan format FF001
            $table->string('form_id', 10); // Mengacu ke scholarship_forms
            $table->string('section_title', 100); // Store the section title to group fields (e.g., "Bagian Baru 1")
            $table->string('field_name', 100); // Nama field (misalnya, "Nama Lengkap")
            $table->string('field_type', 50); // Tipe field (text, date, file, dropdown, dll.)
            $table->string('is_required', 1)->default('0'); // Apakah field wajib (1 = ya, 0 = tidak)
            $table->text('options')->nullable(); // Opsi untuk dropdown (stored as a comma-separated string, not JSON)
            $table->string('order', 3)->default('0'); // Urutan field dalam formulir
            $table->string('file_path')->nullable(); // Store the path to uploaded files (for field_type = 'file')
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by'); // Pembuat field
            $table->unsignedBigInteger('updated_by')->nullable(); // Pengubah field
            $table->timestamps();

            // Foreign keys
            $table->foreign('form_id')->references('form_id')->on('scholarship_forms')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null'); // Changed to 'set null'
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
