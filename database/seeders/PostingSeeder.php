<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PostingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Posting::create([
            'title' => 'Welcome to FSUU Registrar Portal',
            'content' => 'This is a sample announcement for testing the posting system. Welcome to our new document verification portal.',
            'type' => 'announcement',
            'priority_level' => 'high',
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addDays(30),
            'target_audience_id' => null, // Public posting
            'created_by' => 1,
        ]);

        \App\Models\Posting::create([
            'title' => 'System Maintenance Notice',
            'content' => 'Please be informed that system maintenance will be conducted every Sunday from 2:00 AM to 4:00 AM.',
            'type' => 'notification',
            'priority_level' => 'medium',
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addDays(60),
            'target_audience_id' => null, // Public posting
            'created_by' => 1,
        ]);

        \App\Models\Posting::create([
            'title' => 'Archived Test Posting',
            'content' => 'This is a test posting that has been archived for testing purposes.',
            'type' => 'news',
            'priority_level' => 'low',
            'status' => 'active',
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(5),
            'target_audience_id' => null,
            'created_by' => 1,
            'deleted_at' => now(),
        ]);

        \App\Models\Posting::create([
            'title' => 'Important Notification for Administrators',
            'content' => 'This is a notification specifically for administrators regarding system updates and maintenance procedures.',
            'type' => 'notification',
            'priority_level' => 'medium', // Auto-assigned for notifications
            'status' => 'active',
            'start_date' => now(),
            'end_date' => null, // No end date for notifications
            'target_audience_id' => 2, // Assuming role ID 2 exists (admin or staff)
            'created_by' => 1,
        ]);
    }
}
