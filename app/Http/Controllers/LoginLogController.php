<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use Illuminate\Http\Request;

class LoginLogController extends Controller
{
    /**
     * Display a listing of login logs.
     */
    public function index(Request $request)
    {
        $data = LoginLog::with('user:id,username,email')
            ->select([
                'id',
                'user_id', 
                'username',
                'ip_address',
                'user_agent',
                'status',
                'attempted_at',
                'failure_reason'
            ]);

        // Search functionality
        $data->where(function ($query) use ($request) {
            if ($request->search) {
                $query->where("username", 'LIKE', "%$request->search%")
                    ->orWhere("ip_address", 'LIKE', "%$request->search%")
                    ->orWhere("status", 'LIKE', "%$request->search%")
                    ->orWhere("user_agent", 'LIKE', "%$request->search%");
            }
        });

        // Sorting
        if ($request->sort_field && $request->sort_order) {
            if (
                $request->sort_field != '' && $request->sort_field != 'undefined' && $request->sort_field != 'null' &&
                $request->sort_order != '' && $request->sort_order != 'undefined' && $request->sort_order != 'null'
            ) {
                $data->orderBy($request->sort_field, $request->sort_order);
            }
        } else {
            $data->orderBy('attempted_at', 'desc'); // Most recent first
        }

        // Pagination
        if ($request->page_size) {
            $data = $data->limit($request->page_size)
                ->paginate($request->page_size, ['*'], 'page', $request->page)
                ->toArray();
        } else {
            $data = $data->get();
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ], 200);
    }

    /**
     * Log a login attempt
     */
    public static function logAttempt($username, $status, $userId = null, $failureReason = null)
    {
        $request = request();
        
        LoginLog::create([
            'user_id' => $userId,
            'username' => $username,
            'ip_address' => self::getRealIpAddress($request),
            'user_agent' => $request->userAgent(),
            'status' => $status,
            'attempted_at' => now(),
            'failure_reason' => $failureReason,
        ]);
    }

    /**
     * Get the real public IP address, considering proxies and load balancers
     */
    private static function getRealIpAddress($request)
    {
        // For development, try to get a more realistic IP or show local info
        if (app()->environment('local')) {
            // Try to get external IP for development testing
            $externalIp = self::getExternalIp();
            if ($externalIp) {
                return $externalIp;
            }
        }

        // Check for IP from various headers that might contain the real IP
        $ipHeaders = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',            // Proxy
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_REAL_IP',            // Nginx proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'REMOTE_ADDR'                // Standard
        ];

        foreach ($ipHeaders as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]); // Get the first IP if multiple
                
                // Validate IP address (allow private ranges in development)
                $flags = app()->environment('local') 
                    ? FILTER_VALIDATE_IP 
                    : FILTER_VALIDATE_IP | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE;
                    
                if (filter_var($ip, $flags)) {
                    return $ip;
                }
            }
        }

        // Fallback to Laravel's default method
        $defaultIp = $request->ip();
        
        // In development, append indicator
        if (app()->environment('local') && $defaultIp === '127.0.0.1') {
            return $defaultIp . ' (localhost)';
        }
        
        return $defaultIp;
    }

    /**
     * Try to get external IP for development testing (optional)
     */
    private static function getExternalIp()
    {
        try {
            // Only try this in development and with a timeout
            if (app()->environment('local')) {
                $context = stream_context_create([
                    'http' => [
                        'timeout' => 2, // 2 second timeout
                        'ignore_errors' => true
                    ]
                ]);
                
                $ip = @file_get_contents('https://api.ipify.org', false, $context);
                
                if ($ip && filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return trim($ip);
                }
            }
        } catch (\Exception $e) {
            // Silently fail and use fallback
        }
        
        return null;
    }
}
