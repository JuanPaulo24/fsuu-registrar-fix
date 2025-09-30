<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceType;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        $this->call([
            CourseSeeder::class,
            UserRoleSeeder::class,
            ModuleSeeder::class,
            UserSeeder::class,
            UserModuleAccessSeeder::class,
            ModuleTabPermissionsSeeder::class,
            CleanupRedundantPermissionsSeeder::class,
            DetailedModuleButtonsSeeder::class,
            EmailTemplateSeeder::class,
            ServiceTypeSeeder::class,
            CivilStatusSeeder::class,
            CitizenshipSeeder::class,
            SubjectSeeder::class,
            SchoolYearSeeder::class,
            SignatureSeeder::class,
        ]);
    }
}
