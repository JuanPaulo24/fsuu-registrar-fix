<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Disable foreign key checks
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        User::truncate();
        Profile::truncate();
        
        // Re-enable foreign key checks
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $data = [
            [
                'username' => 'superadmin',
                'email' => 'superadmin@urios.edu.ph',
                'email_verified_at' => now(),
                'password' => Hash::make('Admin123!'),
                'role' => 'Super Admin',
                'user_role_id' => 1,
                'status' => 'Active',
                'remember_token' => Str::random(10),
                'created_by' => 1,
                'created_at' => now(),
                'profile' => [
                    'firstname' => 'Super',
                    'lastname' => 'Admin',
                    'created_by' => 1,
                    'created_at' => now(),
                ]
            ],
            [
                'username' => 'juan.delazruz',
                'email' => 'juan.delazruz@urios.edu.ph',
                'email_verified_at' => now(),
                'password' => Hash::make('Admin123!'),
                'role' => 'Registrar Staff',
                'user_role_id' => 3,
                'status' => 'Active',
                'remember_token' => Str::random(10),
                'created_by' => 1,
                'created_at' => now(),
                'profile' => [
                    'firstname' => 'JUAN',
                    'lastname' => 'DELACRUZ',
                    'middlename' => 'C',
                    'course_id' => 6,
                    'created_by' => 1,
                    'created_at' => now(),
                ]
                ],
            [
                'username' => 'alvin.pinedo',
                'email' => 'alvin_pinedo@urio.edu.ph',
                'email_verified_at' => now(),
                'password' => Hash::make('Admin123!'),
                'role' => 'University Registrar',
                'user_role_id' => 4,
                'status' => 'Active',
                'remember_token' => Str::random(10),
                'created_by' => 1,
                'created_at' => now(),
                'profile' => [
                    'firstname' => 'ALVIN',
                    'lastname' => 'PINEDO',
                    'middlename' => 'C',
                    'course_id' => 5,
                    'created_by' => 1,
                    'created_at' => now(),
                ]
            ],
            [
                'username' => 'lamberto.boligor',
                'email' => 'lamberto.boligor@urio.edu.ph',
                'email_verified_at' => now(),
                'password' => Hash::make('Admin123!'),
                'role' => 'Dean',
                'user_role_id' => 5,
                'status' => 'Active',
                'remember_token' => Str::random(10),
                'created_by' => 1,
                'created_at' => now(),
                'profile' => [
                    'firstname' => 'LAMBERTO',
                    'lastname' => 'BOLIGOR',
                    'middlename' => 'C',
                    'course_id' => 4,
                    'created_by' => 1,
                    'created_at' => now(),
                ]
            ],
            [
                'username' => 'arlyn.floreta',
                'email' => 'arlyn.floreta@urio.edu.ph',
                'email_verified_at' => now(),
                'password' => Hash::make('Admin123!'),
                'role' => 'Vice President for Academic Affairs and Research',
                'user_role_id' => 7,
                'status' => 'Active',
                'remember_token' => Str::random(10),
                'created_by' => 1,
                'created_at' => now(),
                'profile' => [
                    'firstname' => 'ARYLN',
                    'lastname' => 'FLORETA',
                    'middlename' => 'M',
                    'course_id' => 2,
                    'created_by' => 1,
                    'created_at' => now(),
                ]
                ],
            [
                'username' => 'randy.odchigue',
                'email' => 'randy.odchigue@urio.edu.ph',
                'email_verified_at' => now(),
                'password' => Hash::make('Admin123!'),
                'role' => 'University President',
                'user_role_id' => 7,
                'status' => 'Active',
                'remember_token' => Str::random(10),
                'created_by' => 1,
                'created_at' => now(),
                'profile' => [
                    'firstname' => 'REV. FR. RANDY JASPHER',
                    'lastname' => 'ODCHIGUE',
                    'middlename' => 'C',
                    'course_id' => 2,
                    'created_by' => 1,
                    'created_at' => now(),
                ]
            ]
        ];

        foreach ($data as $key => $value) {
            $user = User::create(Arr::except($value, ['profile']));
            if ($user) {
                $user->profile()->create($value["profile"]);
            }
        }
    }
}
