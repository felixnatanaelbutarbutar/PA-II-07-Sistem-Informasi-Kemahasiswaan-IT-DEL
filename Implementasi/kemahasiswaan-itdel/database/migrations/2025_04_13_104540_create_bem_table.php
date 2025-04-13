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
            $table->text('vision')->nullable();
            $table->text('mission')->nullable();
            $table->json('structure')->nullable(); // Struktur organisasi dengan foto
            $table->json('work_programs')->nullable();
            $table->string('recruitment_status')->default('CLOSED');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bem');
    }
};