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
        Schema::create('price_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_unit_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('min_qty');
            $table->unsignedBigInteger('price');
            $table->timestamps();
            $table->unique(['product_unit_id', 'min_qty']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_tiers');
    }
};
