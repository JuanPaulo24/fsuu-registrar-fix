<?php

namespace Database\Factories;

use App\Models\DocumentGrade;
use App\Models\IssuedDocument;
use App\Models\Subject;
use App\Models\SchoolYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentGradeFactory extends Factory
{
    protected $model = DocumentGrade::class;

    public function definition(): array
    {
        return [
            'issued_document_id' => IssuedDocument::factory(),
            'subject_id' => Subject::factory(),
            'school_year_id' => SchoolYear::factory(),
            'grade' => $this->faker->randomFloat(1, 1.0, 3.0),
            'units' => $this->faker->numberBetween(1, 6),
            'remarks' => $this->faker->randomElement(['Passed', 'Failed', 'INC', 'Dropped']),
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
