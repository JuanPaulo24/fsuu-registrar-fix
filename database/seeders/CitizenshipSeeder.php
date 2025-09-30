<?php

namespace Database\Seeders;

use App\Models\RefCitizenship;
use Illuminate\Database\Seeder;

class CitizenshipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RefCitizenship::truncate();

        $citizenships = [
            [
                'citizenship' => 'South_African',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Egyptian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Nigerian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Kenyan',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Ethiopan',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Ghanaian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Moroccan',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Algerian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Tunisian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Ugandan',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'American(USA)',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Canadian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Mexican',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Brazilian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Argentinian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Chilean',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Colombian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Peruvian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Venezuelan',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Cuban',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Filipino',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Chinese',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Japanese',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'South_Korean',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'North_Korean',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Indian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Pakistani',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Bangladeshi',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Thai',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Vietnamese',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Indonesian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Malaysian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Singaporean',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Saudi_Arabian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Emirati(UAE)',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Qatari',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Europe',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'British',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'French',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'German',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Italian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Spanish',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Dutch',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Swedish',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Norwegian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Danish',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Finnish',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Spanish',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Polish',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Ukrainian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Swiss',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Belgian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Portuguese',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Australian',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'New_Zealander',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Fijah',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'citizenship' => 'Papua_New_Guinean',
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        RefCitizenship::insert($citizenships);
    }
}
