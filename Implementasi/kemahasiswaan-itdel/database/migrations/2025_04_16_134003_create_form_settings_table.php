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
        // database/migrations/xxxx_xx_xx_create_form_settings_table.php
        Schema::create('form_settings', function (Blueprint $table) {
            $table->string('setting_id', 10)->primary();
            $table->string('form_id', 10);
            $table->boolean('accept_responses')->default(true);
            $table->boolean('one_submission_per_email')->default(false);
            $table->boolean('allow_edit')->default(true);
            $table->dateTime('submission_deadline')->nullable();
            $table->unsignedInteger('max_submissions')->nullable();
            $table->boolean('response_notification')->default(false);
            $table->boolean('is_active')->default(true); // Keep only one is_active
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('form_id')->references('form_id')->on('scholarship_forms')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            $table->index('form_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_settings');
    }
};
