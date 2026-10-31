<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'receipt_number' => fake()->unique()->bothify('TRX-########'),
            'user_id' => User::factory(),
            'total_amount' => 0,
            'total_cost' => 0,
            'total_profit' => 0,
            'status' => 'paid',
            'note' => null,
        ];
    }
}
