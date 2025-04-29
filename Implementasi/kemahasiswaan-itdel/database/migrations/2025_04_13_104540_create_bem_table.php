<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bem', function (Blueprint $table) {
            $table->id();
            $table->text('introduction')->nullable(); // Kolom untuk perkenalan tentang BEM
            $table->text('vision')->nullable();
            $table->json('mission')->nullable(); // Ubah mission menjadi JSON untuk menyimpan array
            $table->json('structure')->nullable(); // Struktur organisasi dengan foto
            $table->json('work_programs')->nullable(); // Ubah work_programs menjadi JSON dengan description dan programs
            $table->string('logo')->nullable(); // Kolom untuk menyimpan path logo
            $table->string('recruitment_status')->default('CLOSED');
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bem');
    }
};
