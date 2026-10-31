<?php

namespace Database\Factories;

use App\Models\PriceTier;
use App\Models\ProductUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PriceTier>
 */
class PriceTierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_unit_id' => ProductUnit::factory(),
            'min_qty' => 1,
            'price' => 1000,
        ];
    }
}
