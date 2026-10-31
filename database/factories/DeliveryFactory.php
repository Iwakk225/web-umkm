<?php

namespace Database\Factories;

use App\Models\Delivery;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Delivery>
 */
class DeliveryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'recipient' => fake()->name(),
            'destination' => fake()->address(),
            'package_length_cm' => 40,
            'package_width_cm' => 30,
            'package_height_cm' => 25,
            'package_count' => 1,
            'actual_weight_grams' => 1700,
            'volume_cm3' => 30000,
            'volumetric_weight_grams' => 5000,
            'recommended_vehicle' => 'Pickup',
            'status' => 'draft',
            'note' => null,
        ];
    }
}
