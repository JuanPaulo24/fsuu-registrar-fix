<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;

class SystemHealthController extends Controller
{
    /**
     * Check if the private key path is accessible
     *
     * @return JsonResponse
     */
    public function checkPrivateKeyPath(): JsonResponse
    {
        try {
            // Get the private key path from config
            $privateKeyPath = config('crypto.private_key_path');
            
            // Check if the path is configured
            if (empty($privateKeyPath)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Private key path is not configured',
                    'accessible' => false,
                    'path' => null
                ], 500);
            }

            // Check if the file exists
            if (!File::exists($privateKeyPath)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Private key file does not exist',
                    'accessible' => false,
                    'path' => $privateKeyPath
                ], 404);
            }

            // Check if the file is readable
            if (!File::isReadable($privateKeyPath)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Private key file exists but is not readable',
                    'accessible' => false,
                    'path' => $privateKeyPath
                ], 403);
            }

            // If we get here, the file exists and is readable
            return response()->json([
                'status' => 'success',
                'message' => 'Private key file is accessible',
                'accessible' => true,
                'path' => $privateKeyPath
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while checking private key path: ' . $e->getMessage(),
                'accessible' => false,
                'path' => null
            ], 500);
        }
    }
} 