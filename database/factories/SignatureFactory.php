<?php

namespace Database\Factories;

use App\Models\Signature;
use Illuminate\Database\Eloquent\Factories\Factory;

class SignatureFactory extends Factory
{
    protected $model = Signature::class;

    public function definition(): array
    {
        return [
            'key_id' => $this->faker->uuid(),
            'algorithm' => $this->faker->randomElement(['RSA', 'DSA', 'ECDSA']),
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
