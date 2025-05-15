<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMpmTable extends Migration
{
    public function up()
    {
        Schema::create('mpms', function (Blueprint $table) {
            $table->id();
            $table->string('logo')->nullable();
            $table->text('introduction');
            $table->text('vision');
            $table->json('mission');
            $table->json('structure'); // Berisi chairman, secretary, dan commissions
            $table->enum('recruitment_status', ['OPEN', 'CLOSED'])->default('OPEN');
            $table->enum('aspiration_status', ['OPEN', 'CLOSED'])->default('OPEN'); // Kolom baru untuk status aspirasi
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mpms');
    }
}