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
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_unit_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('unit_name', 60);
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('quantity_base');
            $table->unsignedBigInteger('unit_price');
            $table->unsignedBigInteger('unit_cost_per_base');
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('cost_total');
            $table->bigInteger('profit');
            $table->timestamps();
            $table->index(['product_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};
