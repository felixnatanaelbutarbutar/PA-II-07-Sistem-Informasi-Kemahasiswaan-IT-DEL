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
        Schema::table('form_settings', function (Blueprint $table) {
            $table->dropColumn([
                'one_submission_per_email',
                'allow_edit',
                'is_active',
                'response_notification',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('form_settings', function (Blueprint $table) {
            $table->boolean('one_submission_per_email')->default(false)->after('accept_responses');
            $table->boolean('allow_edit')->default(true)->after('one_submission_per_email');
            $table->boolean('is_active')->default(false)->after('max_submissions');
            $table->boolean('response_notification')->default(false)->after('is_active');
        });
    }
};