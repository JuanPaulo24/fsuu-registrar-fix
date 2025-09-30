<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cryptographic Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for cryptographic operations
    | including digital signatures and key management.
    |
    */

    'private_key_path' => storage_path('app/private/keys/2025/registrar-2025-07.pem'),
    
    'public_key_path' => storage_path('app/private/keys/2025/registrar-2025-07.pub'),
    
    'default_algorithm' => env('SIGNATURE_ALGORITHM', 'ES256'),
    
    'key_id' => env('KEY_ID', 'registrar-2025-07'),
    
    'aes_key_path' => storage_path('app/private/keys/2025/aes-2025-07.pem'),
    
    'aes_key_id' => env('AES_KEY_ID', 'aes-2025-07'),
];
