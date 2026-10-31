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
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recipient');
            $table->string('destination');
            $table->unsignedInteger('package_length_cm');
            $table->unsignedInteger('package_width_cm');
            $table->unsignedInteger('package_height_cm');
            $table->unsignedInteger('package_count');
            $table->unsignedBigInteger('actual_weight_grams');
            $table->unsignedBigInteger('volume_cm3');
            $table->unsignedBigInteger('volumetric_weight_grams');
            $table->string('recommended_vehicle', 40);
            $table->string('status', 20)->default('draft');
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
