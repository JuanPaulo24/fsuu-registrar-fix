<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Calendar;

class CalendarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Calendar::create([
            'event_title' => 'Event Title 1',
            'event_description' => 'This is a multi-day academic event spanning several days.',
            'event_type' => 'Academic Events',
            'status' => 'active',
            'start_date' => '2025-08-28 09:00:00',
            'end_date' => '2025-08-30 17:00:00',
            'created_by' => 1,
        ]);

        Calendar::create([
            'event_title' => 'Event Title 2',
            'event_description' => 'Training and development workshop for faculty.',
            'event_type' => 'Training and Development',
            'status' => 'active',
            'start_date' => '2025-09-02 08:00:00',
            'end_date' => '2025-09-02 18:00:00',
            'created_by' => 1,
        ]);

        Calendar::create([
            'event_title' => 'Event Title 3',
            'event_description' => 'Single day cultural event.',
            'event_type' => 'Cultural Events',
            'status' => 'active',
            'start_date' => '2025-08-04 10:00:00',
            'end_date' => null, // No end date
            'created_by' => 1,
        ]);

        Calendar::create([
            'event_title' => 'Event Title 4',
            'event_description' => 'Multi-day institutional program spanning a week.',
            'event_type' => 'Institutional & Program Events',
            'status' => 'active',
            'start_date' => '2025-08-08 09:00:00',
            'end_date' => '2025-08-10 17:00:00',
            'created_by' => 1,
        ]);

        Calendar::create([
            'event_title' => 'Event Title 5',
            'event_description' => 'Competition event for students.',
            'event_type' => 'Competitions',
            'status' => 'active',
            'start_date' => '2025-08-08 14:00:00',
            'end_date' => '2025-08-09 16:00:00',
            'created_by' => 1,
        ]);
    }
}