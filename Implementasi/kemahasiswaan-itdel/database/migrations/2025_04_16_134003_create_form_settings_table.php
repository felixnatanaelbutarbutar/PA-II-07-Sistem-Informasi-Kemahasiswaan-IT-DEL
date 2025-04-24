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
        Schema::create('form_settings', function (Blueprint $table) {
            $table->string('setting_id', 10)->primary(); // ID seperti FS001
            $table->string('form_id', 10); // Relasi ke scholarship_forms
            $table->boolean('is_active')->default(true); // Aktif atau tidak
            $table->boolean('accept_responses')->default(true); // Menerima respons atau tidak
            $table->boolean('one_submission_per_email')->default(false); // Satu submit per email
            $table->boolean('allow_edit')->default(true); // Boleh edit setelah submit
            $table->dateTime('submission_deadline')->nullable(); // Deadline pengumpulan
            $table->unsignedInteger('max_submissions')->nullable(); // Maksimal submit
            $table->boolean('response_notification')->default(false); // Notifikasi submit
            $table->unsignedBigInteger('created_by'); // User pembuat
            $table->unsignedBigInteger('updated_by')->nullable(); // User pengubah
            $table->timestamps();

            // Foreign keys
            $table->foreign('form_id')->references('form_id')->on('scholarship_forms')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            $table->index('form_id'); // Optimasi query
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
