<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfileFactory extends Factory
{
    protected $model = Profile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'firstname' => $this->faker->firstName(),
            'lastname' => $this->faker->lastName(),
            'middlename' => $this->faker->firstName(),
            'name_ext' => $this->faker->randomElement(['Jr.', 'Sr.', 'III', null]),
            'id_number' => $this->faker->unique()->numerify('221000#####'),
            'birthplace' => $this->faker->city(),
            'birthdate' => $this->faker->date(),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'citizenship' => 'Filipino',
            'religion' => $this->faker->randomElement(['Catholic', 'Protestant', 'Islam', 'Others']),
            'civil_status' => $this->faker->randomElement(['Single', 'Married', 'Divorced', 'Widowed']),
            'address' => $this->faker->address(),
            'father_name' => $this->faker->name('male'),
            'mother_name' => $this->faker->name('female'),
            'spouse_name' => $this->faker->optional()->name(),
            'course' => $this->faker->randomElement([
                'Bachelor of Science in Information Technology',
            ]),
            'elem_school' => $this->faker->company() . ' Elementary School',
            'elem_lastyearattened' => $this->faker->year(),
            'junior_high_school' => $this->faker->company() . ' Junior High School',
            'junior_high_school_lastyearattened' => $this->faker->year(),
            'senior_high_school' => $this->faker->company() . ' Senior High School',
            'senior_high_school_lastyearattened' => $this->faker->year(),
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
