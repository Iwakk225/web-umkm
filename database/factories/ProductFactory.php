<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'sku' => fake()->unique()->bothify('SKU-####??'),
            'name' => fake()->unique()->words(3, true),
            'stock_quantity' => 0,
            'low_stock_threshold' => 10,
            'average_cost' => 0,
            'is_active' => true,
        ];
    }
}
