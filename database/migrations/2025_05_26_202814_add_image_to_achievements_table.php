<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('achievements', function (Blueprint $table) {
            $table->string('image')->nullable()->after('event_date'); // Kolom image
            // Kolom is_active sudah ada di migrasi awal, jadi kita pastikan konsistensi
            if (!Schema::hasColumn('achievements', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('image'); // Tambahkan jika belum ada
            }
        });
    }

    public function down()
    {
        Schema::table('achievements', function (Blueprint $table) {
            $table->dropColumn('image');
            if (Schema::hasColumn('achievements', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};