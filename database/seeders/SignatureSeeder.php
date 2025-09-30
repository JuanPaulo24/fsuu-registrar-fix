<?php

namespace Database\Seeders;

use App\Models\Signature;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SignatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $signature = [
            [
                'key_id' => 'registrar-2025-07',
                'algorithm' => 'ES256',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        Signature::truncate();
        Signature::insert($signature);
    }
}
