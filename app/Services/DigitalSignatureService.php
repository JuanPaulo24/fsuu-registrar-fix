<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class DigitalSignatureService
{
    /**
     * Generate a digital signature for JSON data using ES256 algorithm
     *
     * @param array $data The data to sign
     * @param string|null $privateKeyPath Optional path to private key
     * @return array
     */
    public function signData(array $data, string $privateKeyPath = null): array
    {
        try {
            // Get private key path from config if not provided
            if (!$privateKeyPath) {
                $privateKeyPath = config('crypto.private_key_path');
            }

            // Convert relative path to absolute if needed
            if (!str_starts_with($privateKeyPath, '/') && !preg_match('/^[a-zA-Z]:/', $privateKeyPath)) {
                // If it starts with ../ it's relative to project root
                if (str_starts_with($privateKeyPath, '../')) {
                    $privateKeyPath = base_path(substr($privateKeyPath, 3));
                } else {
                    $privateKeyPath = storage_path($privateKeyPath);
                }
            }

            // Ensure the private key file exists
            if (!File::exists($privateKeyPath)) {
                // Create the directory if it doesn't exist
                $keyDir = dirname($privateKeyPath);
                if (!File::exists($keyDir)) {
                    File::makeDirectory($keyDir, 0755, true);
                }
                
                // Generate a new key pair if it doesn't exist
                $this->generateKeyPair($privateKeyPath);
            }

            // Read the private key
            $privateKey = File::get($privateKeyPath);
            
            if (empty($privateKey)) {
                throw new \Exception('Private key file is empty');
            }

            // Convert data to JSON string for signing
            $jsonData = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            
            // Create signature using OpenSSL
            $signature = '';
            $success = openssl_sign($jsonData, $signature, $privateKey, OPENSSL_ALGO_SHA256);
            
            if (!$success) {
                throw new \Exception('Failed to create digital signature: ' . openssl_error_string());
            }

            // Encode signature in base64url format (JWT standard)
            $base64Signature = $this->base64UrlEncode($signature);

            return [
                'success' => true,
                'data' => $data,
                'signature' => $base64Signature,
                'algorithm' => 'ES256',
                'signed_at' => now()->toISOString()
            ];

        } catch (\Exception $e) {
            Log::error('Digital signature error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => $data,
                'signature' => null
            ];
        }
    }

    /**
     * Verify a digital signature
     *
     * @param array $data Original data
     * @param string $signature Base64url encoded signature
     * @param string|null $publicKeyPath Optional path to public key
     * @return bool
     */
    public function verifySignature(array $data, string $signature, string $publicKeyPath = null): bool
    {
        try {
            // Get public key path
            if (!$publicKeyPath) {
                $publicKeyPath = config('crypto.public_key_path');
            }

            // Convert relative path to absolute if needed
            if (!str_starts_with($publicKeyPath, '/') && !preg_match('/^[a-zA-Z]:/', $publicKeyPath)) {
                if (str_starts_with($publicKeyPath, '../')) {
                    $publicKeyPath = base_path(substr($publicKeyPath, 3));
                } else {
                    $publicKeyPath = storage_path($publicKeyPath);
                }
            }

            if (!File::exists($publicKeyPath)) {
                return false;
            }

            // Read the public key
            $publicKey = File::get($publicKeyPath);
            
            // Convert data back to JSON string
            $jsonData = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            
            // Decode the signature
            $binarySignature = $this->base64UrlDecode($signature);
            
            // Verify signature
            $result = openssl_verify($jsonData, $binarySignature, $publicKey, OPENSSL_ALGO_SHA256);
            
            return $result === 1;

        } catch (\Exception $e) {
            Log::error('Signature verification error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate a new EC key pair for ES256
     *
     * @param string $privateKeyPath Path where to save the private key
     * @return bool
     */
    private function generateKeyPair(string $privateKeyPath): bool
    {
        try {
            // Generate EC key pair using P-256 curve (required for ES256)
            $config = [
                "curve_name" => "prime256v1", // P-256 curve for ES256
                "private_key_type" => OPENSSL_KEYTYPE_EC,
            ];

            $keyResource = openssl_pkey_new($config);
            
            if (!$keyResource) {
                throw new \Exception('Failed to generate key pair: ' . openssl_error_string());
            }

            // Export private key
            $privateKey = '';
            $success = openssl_pkey_export($keyResource, $privateKey);
            
            if (!$success) {
                throw new \Exception('Failed to export private key: ' . openssl_error_string());
            }

            // Save private key
            File::put($privateKeyPath, $privateKey);
            File::chmod($privateKeyPath, 0600); // Secure permissions

            // Export public key
            $publicKeyDetails = openssl_pkey_get_details($keyResource);
            $publicKey = $publicKeyDetails['key'];

            // Save public key
            $publicKeyPath = str_replace('.pem', '.pub', $privateKeyPath);
            File::put($publicKeyPath, $publicKey);
            File::chmod($publicKeyPath, 0644);

            Log::info('Generated new EC key pair for digital signatures', [
                'private_key_path' => $privateKeyPath,
                'public_key_path' => $publicKeyPath
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Key generation error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Base64url encode (JWT standard)
     *
     * @param string $data
     * @return string
     */
    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64url decode (JWT standard)
     *
     * @param string $data
     * @return string
     */
    private function base64UrlDecode(string $data): string
    {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }

    /**
     * Resolve the current signature configuration from database based on environment
     *
     * @return array
     */
    public function resolveCurrentSignature(): array
    {
        try {
            $configKeyId = config('crypto.key_id');
            $configAlgorithm = config('crypto.default_algorithm');
            
            // Find the latest signature that matches our configuration
            $signature = \App\Models\Signature::where('key_id', $configKeyId)
                ->where('algorithm', $configAlgorithm)
                ->latest()
                ->first();
            
            if (!$signature) {
                return [
                    'success' => false,
                    'message' => "No signature found matching key_id: {$configKeyId} and algorithm: {$configAlgorithm}",
                    'config_key_id' => $configKeyId,
                    'config_algorithm' => $configAlgorithm
                ];
            }
            
            // Verify that the private key file exists
            $privateKeyPath = config('crypto.private_key_path');
            
            if (!File::exists($privateKeyPath)) {
                return [
                    'success' => false,
                    'message' => "Private key file does not exist: {$privateKeyPath}",
                    'signature_id' => $signature->id,
                    'key_id' => $signature->key_id,
                    'algorithm' => $signature->algorithm,
                    'resolved_path' => $privateKeyPath
                ];
            }
            
            return [
                'success' => true,
                'signature_id' => $signature->id,
                'key_id' => $signature->key_id,
                'algorithm' => $signature->algorithm,
                'private_key_path' => $privateKeyPath,
                'message' => 'Signature resolved successfully'
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error resolving signature: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get key information
     *
     * @param string|null $privateKeyPath
     * @return array
     */
    public function getKeyInfo(string $privateKeyPath = null): array
    {
        try {
            if (!$privateKeyPath) {
                $privateKeyPath = config('crypto.private_key_path');
            }

            // Convert relative path to absolute if needed
            if (!str_starts_with($privateKeyPath, '/') && !preg_match('/^[a-zA-Z]:/', $privateKeyPath)) {
                if (str_starts_with($privateKeyPath, '../')) {
                    $privateKeyPath = base_path(substr($privateKeyPath, 3));
                } else {
                    $privateKeyPath = storage_path($privateKeyPath);
                }
            }

            if (!File::exists($privateKeyPath)) {
                return [
                    'exists' => false,
                    'message' => 'Private key file does not exist',
                    'resolved_path' => $privateKeyPath
                ];
            }

            $privateKey = File::get($privateKeyPath);
            $keyResource = openssl_pkey_get_private($privateKey);
            
            if (!$keyResource) {
                return [
                    'exists' => true,
                    'valid' => false,
                    'message' => 'Invalid private key format'
                ];
            }

            $details = openssl_pkey_get_details($keyResource);
            
            return [
                'exists' => true,
                'valid' => true,
                'type' => $details['type'],
                'bits' => $details['bits'],
                'curve' => $details['ec']['curve_name'] ?? null,
                'algorithm' => 'ES256',
                'key_id' => pathinfo($privateKeyPath, PATHINFO_FILENAME)
            ];

        } catch (\Exception $e) {
            return [
                'exists' => File::exists($privateKeyPath ?? ''),
                'valid' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
