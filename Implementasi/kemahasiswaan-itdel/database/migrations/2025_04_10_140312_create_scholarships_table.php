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
            $table->string('scholarship_id', 10)->primary(); // pakai format custom seperti 'sb001'
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('poster')->nullable(); // URL atau path gambar poster, nullable
            $table->date('start_date')->nullable(); // tanggal buka pendaftaran
            $table->date('end_date')->nullable();   // tanggal tutup pendaftaran
            $table->string('category_id', 10);
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            $table->foreign('category_id')->references('category_id')->on('scholarship_categories')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('cascade');
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
