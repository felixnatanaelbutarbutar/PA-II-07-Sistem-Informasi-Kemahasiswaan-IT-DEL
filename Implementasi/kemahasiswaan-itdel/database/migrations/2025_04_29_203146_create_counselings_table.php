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
            $table->string('noWhatsApp')->nullable(); // Changed from noTelephone to noWhatsApp
            $table->date('booking_date'); // Booking date
            $table->time('booking_time'); // Booking time
            $table->enum('status', ['menunggu', 'ditolak', 'disetujui'])->default('menunggu'); // Updated status values
            $table->text('rejection_reason')->nullable(); // Add rejection_reason column for rejection reason
            $table->timestamps(); // created_at and updated_at

            // Unique constraint to prevent double booking on the same date and time
            $table->unique(['booking_date', 'booking_time'], 'unique_booking_slot');
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