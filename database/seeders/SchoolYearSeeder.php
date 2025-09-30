<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SchoolYear;

class SchoolYearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
 {
        $school_year = [
            [
                'school_year' => "2025-2026",
                'semester' => "1st Semester",
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'school_year' => "2025-2026",
                'semester' => "2nd Semester",
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'school_year' => "2025-2026",
                'semester' => "Summer",
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];

        SchoolYear::truncate();
        SchoolYear::insert($school_year);
    }
}
