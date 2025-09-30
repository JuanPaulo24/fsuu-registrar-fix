<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\DocumentVerificationData;

class DocumentEncryptionService
{
    private $digitalSignatureService;
    
    public function __construct(DigitalSignatureService $digitalSignatureService)
    {
        $this->digitalSignatureService = $digitalSignatureService;
    }

    /**
     * Complete workflow: Digital Signature -> AES Encryption -> BASE45 Encoding
     */
    public function processDocumentVerification(array $verificationData): array
    {
        try {
            // Step 1: Create digital signature
            $signedData = $this->digitalSignatureService->signData($verificationData);
            
            if (!$signedData['success']) {
                return [
                    'success' => false,
                    'message' => 'Digital signature failed: ' . ($signedData['message'] ?? 'Unknown signature error')
                ];
            }

            // Step 2: Encrypt the signed data with AES-128-GCM
            $encryptedData = $this->encryptWithAES128GCM($signedData['data']);
            
            if (!$encryptedData['success']) {
                return [
                    'success' => false,
                    'message' => 'AES encryption failed: ' . ($encryptedData['message'] ?? 'Unknown encryption error')
                ];
            }

            // Step 3: Encode to BASE45
            $base45Data = $this->encodeToBase45($encryptedData['encrypted']);
            
            if (!$base45Data['success']) {
                return [
                    'success' => false,
                    'message' => 'BASE45 encoding failed: ' . ($base45Data['message'] ?? 'Unknown encoding error')
                ];
            }

            return [
                'success' => true,
                'original_data' => $verificationData,
                'digital_signature' => [
                    'data' => $signedData['data'],
                    'signature' => $signedData['signature'],
                    'algorithm' => $signedData['algorithm'],
                    'signed_at' => $signedData['signed_at']
                ],
                'encrypted_data' => $encryptedData['encrypted'],
                'base45_qr_code' => $base45Data['base45'],
                'qr_code_ready' => true
            ];

        } catch (\Exception $e) {
            Log::error('Document encryption process failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Encryption process failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Encrypt data using AES-128-GCM
     */
    public function encryptWithAES128GCM(array $data): array
    {
        try {
            // Get AES key
            $aesKey = $this->getOrGenerateAESKey();
            if (!$aesKey['success']) {
                return $aesKey;
            }

            // Convert data to JSON
            $jsonData = json_encode($data, JSON_UNESCAPED_SLASHES);
            
            // Generate random IV (12 bytes for GCM)
            $iv = random_bytes(12);
            
            // Encrypt using AES-128-GCM
            $ciphertext = openssl_encrypt(
                $jsonData,
                'aes-128-gcm',
                $aesKey['key'],
                OPENSSL_RAW_DATA,
                $iv,
                $tag
            );

            if ($ciphertext === false) {
                return [
                    'success' => false,
                    'message' => 'AES encryption failed'
                ];
            }

            // Verify tag length is 128 bits (16 bytes)
            if (strlen($tag) !== 16) {
                return [
                    'success' => false,
                    'message' => 'Invalid tag length: expected 16 bytes (128 bits), got ' . strlen($tag)
                ];
            }

            return [
                'success' => true,
                'encrypted' => [
                    'algorithm' => 'A128GCM',
                    'key_id' => config('crypto.aes_key_id'),
                    'iv' => base64url_encode($iv),
                    'ct' => base64url_encode($ciphertext),
                    'tag' => base64url_encode($tag)
                ],
                // Also provide standard base64 format for online tool compatibility
                'devglan_format' => [
                    'algorithm' => 'A128GCM',
                    'key_id' => config('crypto.aes_key_id'),
                    'iv' => base64_encode($iv),
                    'ct' => base64_encode($ciphertext),
                    'tag' => base64_encode($tag)
                ]
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'AES encryption error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Encode data to BASE45 format
     */
    public function encodeToBase45($data): array
    {
        try {
            // Handle different input types
            if (is_array($data)) {
                // Convert array to JSON
                $inputString = json_encode($data, JSON_UNESCAPED_SLASHES);
            } elseif (is_string($data)) {
                // Use string directly
                $inputString = $data;
            } else {
                // Convert other types to JSON
                $inputString = json_encode($data, JSON_UNESCAPED_SLASHES);
            }
            
            // Encode to BASE45 (using RFC 9285 compliant implementation)
            $base45String = $this->base45Encode($inputString);

            return [
                'success' => true,
                'base45' => $base45String
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'BASE45 encoding error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate QR code from BASE45 data
     */
    public function generateQRCode(string $base45Data, string $filePath): array
    {
        try {
            // Use the endroid/qr-code library to generate a proper QR code
            $qrCode = new \Endroid\QrCode\QrCode(
                data: $base45Data,
                size: 500,
                margin: 5,
                errorCorrectionLevel: \Endroid\QrCode\ErrorCorrectionLevel::High // Higher error correction for logo overlay
            );

            $writer = new \Endroid\QrCode\Writer\PngWriter();
            $result = $writer->write($qrCode);

            // Compose: white punchout behind transparent logo to avoid black halo
            $pngData = $result->getString();
            $logoPath = public_path('images/tabicon.png');
            if (function_exists('imagecreatefromstring')) {
                $qrImg = imagecreatefromstring($pngData);
                if ($qrImg !== false) {
                    $w = imagesx($qrImg);
                    $h = imagesy($qrImg);

                    // Base canvas with white background
                    $canvas = imagecreatetruecolor($w, $h);
                    $white = imagecolorallocate($canvas, 255, 255, 255);
                    imagefill($canvas, 0, 0, $white);
                    imagealphablending($canvas, true);
                    imagesavealpha($canvas, false);

                    // Draw QR on canvas
                    imagecopy($canvas, $qrImg, 0, 0, 0, 0, $w, $h);

                    if (file_exists($logoPath)) {
                        // Load logo with alpha
                        $logoContent = @file_get_contents($logoPath);
                        $logoSrc = $logoContent ? @imagecreatefromstring($logoContent) : false;
                        if ($logoSrc !== false) {
                            $logoW = imagesx($logoSrc);
                            $logoH = imagesy($logoSrc);
                            $targetW = max(80, (int) round($w * 0.22));
                            $targetH = (int) round($targetW * ($logoH / max(1, $logoW)));

                            $logoResized = imagecreatetruecolor($targetW, $targetH);
                            imagealphablending($logoResized, false);
                            imagesavealpha($logoResized, true);
                            $transparent = imagecolorallocatealpha($logoResized, 0, 0, 0, 127);
                            imagefill($logoResized, 0, 0, $transparent);
                            imagecopyresampled($logoResized, $logoSrc, 0, 0, 0, 0, $targetW, $targetH, $logoW, $logoH);

                            // Punch-out white ellipse slightly larger than logo to remove black underlay
                            $cx = (int) ($w / 2);
                            $cy = (int) ($h / 2);
                            $punchW = (int) ($targetW * 1.12);
                            $punchH = (int) ($targetH * 1.12);
                            imagefilledellipse($canvas, $cx, $cy, $punchW, $punchH, $white);

                            // Overlay logo centered preserving transparency
                            $posX = (int) (($w - $targetW) / 2);
                            $posY = (int) (($h - $targetH) / 2);
                            imagealphablending($canvas, true);
                            imagesavealpha($canvas, false);
                            imagecopy($canvas, $logoResized, $posX, $posY, 0, 0, $targetW, $targetH);

                            imagedestroy($logoResized);
                            imagedestroy($logoSrc);
                        }
                    }

                    // Output flattened PNG
                    ob_start();
                    imagepng($canvas);
                    $finalData = ob_get_clean();
                    imagedestroy($qrImg);
                    imagedestroy($canvas);

                    file_put_contents($filePath, $finalData);
                } else {
                    file_put_contents($filePath, $pngData);
                }
            } else {
                file_put_contents($filePath, $pngData);
            }

            return [
                'success' => true,
                'qr_path' => $filePath,
                'message' => 'QR code generated successfully'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'QR code generation failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get or generate AES key
     */
    private function getOrGenerateAESKey(): array
    {
        try {
            $aesKeyPath = config('crypto.aes_key_path');
            
            // Convert relative path to absolute if needed
            if (!str_starts_with($aesKeyPath, '/') && !preg_match('/^[a-zA-Z]:/', $aesKeyPath)) {
                if (str_starts_with($aesKeyPath, '../')) {
                    $aesKeyPath = base_path(substr($aesKeyPath, 3));
                } else {
                    $aesKeyPath = storage_path($aesKeyPath);
                }
            }

            // Create directory if it doesn't exist
            $keyDir = dirname($aesKeyPath);
            if (!File::exists($keyDir)) {
                File::makeDirectory($keyDir, 0755, true);
            }

            // Generate new AES key if it doesn't exist
            if (!File::exists($aesKeyPath)) {
                $aesKey = random_bytes(16); // 128 bits
                File::put($aesKeyPath, base64_encode($aesKey));
                chmod($aesKeyPath, 0600);
            }

            // Read the AES key
            $encodedKey = File::get($aesKeyPath);
            $aesKey = base64_decode($encodedKey);

            if (strlen($aesKey) !== 16) {
                return [
                    'success' => false,
                    'message' => 'Invalid AES key length: expected 16 bytes (128 bits), got ' . strlen($aesKey)
                ];
            }

            return [
                'success' => true,
                'key' => $aesKey
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'AES key error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Public method to decode BASE45 data
     */
    public function decodeFromBase45(string $base45Data): array
    {
        try {
            $decoded = $this->base45Decode($base45Data);
            return [
                'success' => true,
                'decoded' => $decoded
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'BASE45 decoding failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * BASE45 encoding implementation (RFC 9285 compliant - matches dcode.fr)
     */
    private function base45Encode(string $data): string
    {
        // BASE45 character set as defined in RFC 9285
        $alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
        $result = '';
        
        // Convert string to bytes
        $bytes = array_values(unpack('C*', $data));
        $length = count($bytes);
        
        // Process bytes in groups of 2 (RFC 9285 specification)
        for ($i = 0; $i < $length; $i += 2) {
            if ($i + 1 < $length) {
                // Two bytes: n = (a × 256) + b where a=first byte, b=second byte
                $a = $bytes[$i];
                $b = $bytes[$i + 1];
                $n = ($a * 256) + $b;
                
                // Convert to base 45: n = c + (d × 45) + (e × 45²)
                $c = $n % 45;
                $n = intval($n / 45);
                $d = $n % 45;
                $n = intval($n / 45);
                $e = $n % 45;
                
                $result .= $alphabet[$c] . $alphabet[$d] . $alphabet[$e];
            } else {
                // Single byte: a = b + (45 × c)
                $a = $bytes[$i];
                $b = $a % 45;
                $c = intval($a / 45);
                
                $result .= $alphabet[$b] . $alphabet[$c];
            }
        }
        
        return $result;
    }

    /**
     * BASE45 decoding implementation (RFC 9285 compliant - matches dcode.fr)
     */
    private function base45Decode(string $encoded): string
    {
        // BASE45 character set as defined in RFC 9285
        $alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
        $charMap = array_flip(str_split($alphabet));
        $result = '';
        
        $len = strlen($encoded);
        
        // Process in chunks of 3 characters (RFC 9285 specification)
        for ($i = 0; $i < $len; $i += 3) {
            $chunk = substr($encoded, $i, 3);
            $chunkLen = strlen($chunk);
            
            if ($chunkLen === 3) {
                // Three characters [c,d,e] -> two bytes
                // n = c + (d × 45) + (e × 45²)
                // Then: a = n ÷ 256 (integer), b = n mod 256
                $c = isset($charMap[$chunk[0]]) ? $charMap[$chunk[0]] : 0;
                $d = isset($charMap[$chunk[1]]) ? $charMap[$chunk[1]] : 0;
                $e = isset($charMap[$chunk[2]]) ? $charMap[$chunk[2]] : 0;
                
                $n = $c + ($d * 45) + ($e * 45 * 45);
                
                if ($n > 65535) {
                    throw new \Exception("Invalid Base45: value too large");
                }
                
                // Convert back to bytes: n = (a × 256) + b
                $a = intval($n / 256);
                $b = $n % 256;
                
                $result .= chr($a) . chr($b);
                
            } elseif ($chunkLen === 2) {
                // Two characters [b,c] -> one byte  
                // a = b + (45 × c)
                $b = isset($charMap[$chunk[0]]) ? $charMap[$chunk[0]] : 0;
                $c = isset($charMap[$chunk[1]]) ? $charMap[$chunk[1]] : 0;
                
                $a = $b + ($c * 45);
                
                if ($a > 255) {
                    throw new \Exception("Invalid Base45: single byte value too large");
                }
                
                $result .= chr($a);
            }
        }
        
        return $result;
    }

    /**
     * Decrypt AES-128-GCM data
     */
    public function decryptAES128GCM(array $encryptedData): array
    {
        try {
            $aesKey = $this->getOrGenerateAESKey();
            if (!$aesKey['success']) {
                return $aesKey;
            }

            $iv = base64url_decode($encryptedData['iv']);
            $ciphertext = base64url_decode($encryptedData['ct']);
            $tag = base64url_decode($encryptedData['tag']);

            $decrypted = openssl_decrypt(
                $ciphertext,
                'aes-128-gcm',
                $aesKey['key'],
                OPENSSL_RAW_DATA,
                $iv,
                $tag
            );

            if ($decrypted === false) {
                return [
                    'success' => false,
                    'message' => 'AES decryption failed'
                ];
            }

            return [
                'success' => true,
                'decrypted' => json_decode($decrypted, true)
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'AES decryption error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Convert base64url to standard base64 format for online tools
     */
    public function convertToStandardBase64(array $encryptedData): array
    {
        return [
            'algorithm' => $encryptedData['algorithm'],
            'key_id' => $encryptedData['key_id'],
            'iv' => str_pad(strtr($encryptedData['iv'], '-_', '+/'), strlen($encryptedData['iv']) % 4, '=', STR_PAD_RIGHT),
            'ct' => str_pad(strtr($encryptedData['ct'], '-_', '+/'), strlen($encryptedData['ct']) % 4, '=', STR_PAD_RIGHT),
            'tag' => str_pad(strtr($encryptedData['tag'], '-_', '+/'), strlen($encryptedData['tag']) % 4, '=', STR_PAD_RIGHT)
        ];
    }

    /**
     * Get encryption data formatted specifically for devglan.com online tool
     */
    public function getDevglanFormat(array $encryptedData): array
    {
        return [
            'secret_key' => 'rF3gzfoe0iiEvMB1', // 16 bytes for AES-128
            'iv' => $encryptedData['iv'],
            'ciphertext' => $encryptedData['ct'],
            'tag' => $encryptedData['tag'],
            'algorithm' => 'AES-128-GCM',
            'tag_length' => '128'
        ];
    }

    /**
     * Save verification data to database and return hash for QR code
     */
    public function saveVerificationData($base45Data): array
    {
        try {
            // Generate hash of the base45 data
            $verificationHash = DocumentVerificationData::generateHash($base45Data);
            
            // Save to database (no issued_document_id, original_data, algorithm, or key_id)
            $verificationRecord = DocumentVerificationData::create([
                'verification_hash' => $verificationHash,
                'base45_data' => $base45Data,
                'created_by' => auth()->id(),
            ]);

            return [
                'success' => true,
                'verification_hash' => $verificationHash,
                'verification_id' => $verificationRecord->id,
                'message' => 'Verification data saved successfully'
            ];

        } catch (\Exception $e) {
            Log::error('Failed to save verification data: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to save verification data: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process and save document verification data
     */
    public function processAndSaveDocumentVerification(array $verificationData): array
    {
        try {
            // Step 1: Process the verification (existing logic)
            $processedData = $this->processDocumentVerification($verificationData);
            
            if (!$processedData['success']) {
                return $processedData;
            }

            // Step 2: Save verification data to database (only base45 data)
            $saveResult = $this->saveVerificationData($processedData['base45_qr_code']);

            if (!$saveResult['success']) {
                return $saveResult;
            }

            // Step 3: Return processed data with hash instead of base45 for QR code
            return [
                'success' => true,
                'original_data' => $processedData['original_data'],
                'digital_signature' => $processedData['digital_signature'],
                'encrypted_data' => $processedData['encrypted_data'],
                'base45_qr_code' => $saveResult['verification_hash'], // Return hash instead of base45
                'verification_hash' => $saveResult['verification_hash'],
                'verification_id' => $saveResult['verification_id'],
                'qr_code_ready' => true
            ];

        } catch (\Exception $e) {
            Log::error('Document verification processing and saving failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Verification processing failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Retrieve verification data by hash
     */
    public function getVerificationDataByHash($hash): array
    {
        try {
            $verificationData = DocumentVerificationData::findByHash($hash);
            
            if (!$verificationData) {
                return [
                    'success' => false,
                    'message' => 'Verification data not found'
                ];
            }

            // Decode the base45 data
            $decodedResult = $this->decodeFromBase45($verificationData->base45_data);
            
            if (!$decodedResult['success']) {
                return [
                    'success' => false,
                    'message' => 'Failed to decode base45 data'
                ];
            }

            // The decoded base45 data should be a JSON string containing the encrypted data structure
            $encryptedDataStruct = json_decode($decodedResult['decoded'], true);
            
            if (!$encryptedDataStruct) {
                return [
                    'success' => false,
                    'message' => 'Failed to parse encrypted data structure'
                ];
            }

            // Decrypt the AES-128-GCM encrypted data
            $decryptedResult = $this->decryptAES128GCM($encryptedDataStruct);
            
            if (!$decryptedResult['success']) {
                return [
                    'success' => false,
                    'message' => 'Failed to decrypt verification data'
                ];
            }

            // The decrypted data should already be an array containing the original verification data
            $decodedData = $decryptedResult['decrypted'];
            
            if (!is_array($decodedData)) {
                // If it's a JSON string, decode it
                $decodedData = json_decode($decodedData, true);
                if (!$decodedData) {
                    return [
                        'success' => false,
                        'message' => 'Invalid verification data format'
                    ];
                }
            }

            return [
                'success' => true,
                'data' => [
                    'id' => $verificationData->id,
                    'base45_data' => $verificationData->base45_data,
                    'decoded_data' => $decodedData,
                    'created_at' => $verificationData->created_at,
                    // Extract document information from decoded data
                    'document_id' => $decodedData['doc_id'] ?? null,
                    'document_type' => $decodedData['type'] ?? null,
                    'registrar_id' => $decodedData['registrar_id'] ?? null,
                    'issued_at' => $decodedData['issued_at'] ?? null,
                    'algorithm' => $decodedData['algorithm'] ?? null,
                    'key_id' => $decodedData['kid'] ?? null
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Failed to retrieve verification data by hash: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to retrieve verification data: ' . $e->getMessage()
            ];
        }
    }
}

// Helper function for base64url encoding
if (!function_exists('base64url_encode')) {
    function base64url_encode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}

// Helper function for base64url decoding
if (!function_exists('base64url_decode')) {
    function base64url_decode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
}
