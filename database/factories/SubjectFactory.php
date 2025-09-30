<?php

namespace Database\Factories;

use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubjectFactory extends Factory
{
    protected $model = Subject::class;

    public function definition(): array
    {
        return [
            'subject_code' => strtoupper($this->faker->bothify('??###')),
            'subject_name' => $this->faker->words(3, true),
            'unit' => $this->faker->numberBetween(1, 6),
            'semester' => $this->faker->randomElement(['1', '2', 'summer']),
            'year_level' => $this->faker->numberBetween(1, 4),
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
