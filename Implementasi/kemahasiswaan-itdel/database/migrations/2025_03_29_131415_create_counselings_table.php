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
        Schema::create('counselings', function (Blueprint $table) {
            $table->string('id')->primary(); // Custom ID (e.g., csl001)
            $table->foreignId('requestBy')->constrained('users')->onDelete('cascade'); // Relates to users table
            $table->text('issue')->nullable(); // The counseling issue or problem
            $table->string('noTelephone')->nullable(); // Telephone number
            $table->enum('status', ['pending', 'scheduled', 'completed', 'canceled'])->default('pending');
            $table->timestamps(); // created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('counselings');
    }
};