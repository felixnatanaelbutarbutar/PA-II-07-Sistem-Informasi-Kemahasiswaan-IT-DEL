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
        Schema::create('form_submissions', function (Blueprint $table) {
            $table->string('submission_id', 10)->primary();
            $table->string('form_id', 10);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->json('data')->nullable(); // Stores form-specific field data
            $table->json('personal_data')->nullable(); // Optional snapshot of personal data at submission time
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            // Foreign keys
            $table->foreign('form_id')->references('form_id')->on('scholarship_forms')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');

            // Indexes for efficient querying
            $table->index('form_id');
            $table->index('user_id');
            $table->index('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_submissions');
    }
};
