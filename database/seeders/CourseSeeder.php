<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'course_code' => 'BSIT',
                'course_name' => 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'course_code' => 'Ph.D.',
                'course_name' => 'DOCTOR OF PHILOSOPHY',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'course_code' => 'S.Th.D.',
                'course_name' => 'DOCTOR OF SACRED THEOLOGY',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'course_code' => 'MIT',
                'course_name' => 'MASTER IN INFORMATION TECHNOLOGY',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'course_code' => 'MAEM',
                'course_name' => 'MASTER OF ARTS IN EDUCATIONAL MANAGEMENT',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'course_code' => 'LPT',
                'course_name' => 'LICENSED PROFESSIONAL TEACHER',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($courses as $course) {
            Course::firstOrCreate(
                ['course_code' => $course['course_code']],
                $course
            );
        }
    }
}
