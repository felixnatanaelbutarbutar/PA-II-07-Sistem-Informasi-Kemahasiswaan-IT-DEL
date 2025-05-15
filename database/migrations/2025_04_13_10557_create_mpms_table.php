<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use App\Http\Controllers\DirectorController;
use Illuminate\Database\Migrations\Migration;

class CreateMpmsTable extends Migration
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
            $table->enum('aspiration_status', ['OPEN', 'CLOSED'])->default('OPEN');
            $table->boolean('is_active')->default(true); // Kolom is_active
            $table->string('management_period')->nullable()->after('is_active'); // Kolom management_period
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