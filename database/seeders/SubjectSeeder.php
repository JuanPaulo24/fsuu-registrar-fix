<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use \App\Models\Subject;
use Illuminate\Database\Seeder;


class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subject = [
            //1st Year - 1st Semester
            [
                'year_level' => 1,
                'semester' => '1',
                'subject_name' => 'Bridging Subject 1 (Basic Math)',
                'subject_code' => 'BRIDG 001',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '1',
                'subject_name' => 'Computer Fundamentals and Operations',
                'subject_code' => 'IT 170',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '1',
                'subject_name' => 'Fundamentals of Programming and Problem-Solving 1',
                'subject_code' => 'IT171',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '1',
                'subject_name' => 'Discrete Math',
                'subject_code' => 'Math 171',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '1',
                'subject_name' => 'The Contemporary World',
                'subject_code' => 'GE 103',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '1',
                'subject_name' => 'Mathematics in the Modern World',
                'subject_code' => 'GE 104',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '1',
                'subject_name' => 'Purposive Communication',
                'subject_code' => 'GE 105',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '1',
                'subject_name' => 'Movement Competency Training',
                'subject_code' => 'PATHFit 1',
                'unit' => 2,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '1',
                'subject_name' => 'Religions, Religious Experiences & Spirituality',
                'subject_code' => 'Theo 110',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '1',
                'subject_name' => 'Civic Welfare Training Service 1',
                'subject_code' => 'NSTP 1',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            //1st Year - 2nd Semester
            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Bridging Subject 2 (Calculus 2)',
                'subject_code' => 'BRIDG 002',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Bridging Subject 2 (Calculus 2)',
                'subject_code' => 'BRIDG 002',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Principles of Human Computer Interaction1',
                'subject_code' => 'IT 180',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Fundamentals of Programming and Problem-Solving 2',
                'subject_code' => 'IT 181',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Understanding the Self',
                'subject_code' => 'GE 101',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Arts Appreciation',
                'subject_code' => 'GE 106',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Rizal Life and Works',
                'subject_code' => 'GE 109',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Exercise-based Fitness Activities',
                'subject_code' => 'PATHFit 2',
                'unit' => 2,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Balarila ng Wikang Filipino',
                'subject_code' => 'GE 114',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Christian Faith',
                'subject_code' => 'Theo 120',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 1,
                'semester' => '2',
                'subject_name' => 'Civic Welfare Training Service 2',
                'subject_code' => 'NSTP 2',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            //2nd Year - 1st Semester
            [
                'year_level' => 2,
                'semester' => '1',
                'subject_name' => 'Fundamentals of Programming and Problem-Solving 3',
                'subject_code' => 'IT 270',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '1',
                'subject_name' => 'Object Oriented Programming',
                'subject_code' => 'IT 270-EL1',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '1',
                'subject_name' => 'Quantitative Methods',
                'subject_code' => 'IT 271',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '1',
                'subject_name' => 'Data Structures & Algorithms',
                'subject_code' => 'IT 272',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '1',
                'subject_name' => 'Science, Technology and Society',
                'subject_code' => 'GE 107',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '1',
                'subject_name' => 'Individual/Dual Sports, Creative Dance and Arnis',
                'subject_code' => 'PATHFit 3',
                'unit' => 2,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '1',
                'subject_name' => 'Panitikang Filipino',
                'subject_code' => 'GE 116',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '1',
                'subject_name' => 'Philippine Literature',
                'subject_code' => 'GE 117',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '1',
                'subject_name' => 'JEEP Start 1',
                'subject_code' => 'IC-JEEP 110',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '1',
                'subject_name' => 'Community of Disciples',
                'subject_code' => 'Theo 130',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            //2nd Year - 2nd Semester
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'Human Computer Interaction 1',
                'subject_code' => 'IT 280',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'Object Oriented Programming 2',
                'subject_code' => 'IT 281-EL1',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'Fundamentals of Networking',
                'subject_code' => 'IT 280',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'Integrative Programming and Technologies 1',
                'subject_code' => 'IT 281',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'Information Management',
                'subject_code' => 'IT 282',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'Readings in Philippine History',
                'subject_code' => 'GE 102',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'Ethics',
                'subject_code' => 'GE 108',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'Team Sports, Folk Dance, Ballroom and Taekwondo',
                'subject_code' => 'PATHFit 4',
                'unit' => 2,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'Great Books',
                'subject_code' => 'GE 118',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'JEEP Accelerate 1',
                'subject_code' => 'IC-JEEP 120',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 2,
                'semester' => '2',
                'subject_name' => 'Social Teachings of the Catholic Church',
                'subject_code' => 'Theo 140',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            //3rd Year - 1st Semester
            [
                'year_level' => 3,
                'semester' => '1',
                'subject_name' => 'Systems Analysis and Design',
                'subject_code' => 'IT 370',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 3,
                'semester' => '1',
                'subject_name' => 'Advanced Networking',
                'subject_code' => 'IT 370',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 3,
                'semester' => '1',
                'subject_name' => 'Social Issues and Professional Practice',
                'subject_code' => 'IT 371',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 3,
                'semester' => '1',
                'subject_name' => 'Information Assurance and Security 1 (With CISDP - Part 1)',
                'subject_code' => 'IT 372',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 3,
                'semester' => '1',
                'subject_name' => 'Platform Technologies',
                'subject_code' => 'IT 373-EL2',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 3,
                'semester' => '1',
                'subject_name' => 'Integrative Programming & Technologies 2',
                'subject_code' => 'IT 374-EL3',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            //3rd Year - 2nd Semester
            [
                'year_level' => 3,
                'semester' => '2',
                'subject_name' => 'Fundamentals of Database Systems',
                'subject_code' => 'IT 380',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 3,
                'semester' => '2',
                'subject_name' => 'Application Development and Emerging Technologies',
                'subject_code' => 'IT 381',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 3,
                'semester' => '2',
                'subject_name' => 'Systems Administration and Maintenance',
                'subject_code' => 'IT 382',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 3,
                'semester' => '2',
                'subject_name' => 'Web Systems and Technologies',
                'subject_code' => 'IT 383-EL4',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 3,
                'semester' => '2',
                'subject_name' => 'Elements of Research',
                'subject_code' => 'IC-RES 130',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            //3rd Year - Summer
            [
                'year_level' => 3,
                'semester' => 'summer',
                'subject_name' => 'System Integration and Architecture',
                'subject_code' => 'IT 387',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'year_level' => 3,
                'semester' => 'summer',
                'subject_name' => 'Research (Capstone Project 1)',
                'subject_code' => 'IT 386',
                'unit' => 3,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],

            //4th Year - 1st Semester
            [
                    'year_level' => 4,
                    'semester' => '1',
                    'subject_name' => 'Research (Capstone Project 2)',
                    'subject_code' => 'IT 470',
                    'unit' => 3,
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
            ],
            [
                    'year_level' => 4,
                    'semester' => '1',
                    'subject_name' => 'Information Assurance and Security 2 (With CISDP - Part 2)',
                    'subject_code' => 'IT 471',
                    'unit' => 3,
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
            ],
            [
                    'year_level' => 4,
                    'semester' => '1',
                    'subject_name' => 'Systems Integration and Architecture 2',
                    'subject_code' => 'IT 472 – EL5',
                    'unit' => 3,
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
            ],
            [
                    'year_level' => 4,
                    'semester' => '1',
                    'subject_name' => 'Human Computer Interaction 2',
                    'subject_code' => 'IT 473 – EL6',
                    'unit' => 3,
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
            ],
            [
                    'year_level' => 4,
                    'semester' => '1',
                    'subject_name' => 'Living in an IT Era (With MOS Certification)',
                    'subject_code' => 'GE 119',
                    'unit' => 3,
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
            ],

                //4th Year - 2nd Semester
            [
                    'year_level' => 4,
                    'semester' => '2',
                    'subject_name' => 'On Job Training with SAP',
                    'subject_code' => 'IT 470',
                    'unit' => 9,
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
            ],
        ];

        Subject::truncate();
        Subject::insert($subject);
    }
}


