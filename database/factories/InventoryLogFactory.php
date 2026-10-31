<?php

namespace Database\Factories;

use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryLog>
 */
class InventoryLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'transaction_id' => null,
            'user_id' => User::factory(),
            'type' => 'masuk',
            'quantity' => 1,
            'stock_before' => 0,
            'stock_after' => 1,
            'unit_cost' => 1000,
            'note' => null,
        ];
    }
}
