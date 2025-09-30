<?php

namespace Database\Factories;

use App\Models\SchoolYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class SchoolYearFactory extends Factory
{
    protected $model = SchoolYear::class;

    public function definition(): array
    {
        return [
            'school_year' => $this->faker->randomElement(['2022-2023', '2023-2024', '2024-2025', '2025-2026']),
            'semester' => $this->faker->randomElement(['1st Semester', '2nd Semester', 'Summer']),
            'status' => $this->faker->randomElement(['active', 'inactive']),
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
