<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TransactionItem>
 */
class TransactionItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'transaction_id' => Transaction::factory(),
            'product_id' => Product::factory(),
            'product_unit_id' => ProductUnit::factory(),
            'product_name' => fake()->words(3, true),
            'unit_name' => 'pcs',
            'quantity' => 1,
            'quantity_base' => 1,
            'unit_price' => 1000,
            'unit_cost_per_base' => 500,
            'subtotal' => 1000,
            'cost_total' => 500,
            'profit' => 500,
        ];
    }
}
