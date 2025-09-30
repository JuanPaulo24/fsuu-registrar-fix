<?php

namespace Database\Factories;

use App\Models\IssuedDocument;
use App\Models\Profile;
use App\Models\Signature;
use Illuminate\Database\Eloquent\Factories\Factory;

class IssuedDocumentFactory extends Factory
{
    protected $model = IssuedDocument::class;

    public function definition(): array
    {
        return [
            'profile_id' => Profile::factory(),
            'registrar_id' => 1,
            'signature_id' => Signature::factory(),
            'document_type' => $this->faker->randomElement([
                'Transcript of Records',
                'Certificate of Enrollment',
                'Diploma',
                'Certificate of Graduation',
                'Certificate of Good Moral Character'
            ]),
            'document_version' => 'v' . $this->faker->randomFloat(1, 1, 5),
            'serial_number' => strtoupper($this->faker->bothify('??-####-###')),
            'document_id_number' => strtoupper($this->faker->bothify('DOC-###-####')),
            'current_version' => $this->faker->randomFloat(1, 1, 5),
            'date_issued' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'date_revoked' => $this->faker->dateTimeBetween('now', '+5 years'),
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
