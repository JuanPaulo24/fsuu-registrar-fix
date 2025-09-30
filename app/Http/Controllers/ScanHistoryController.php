<?php

namespace App\Http\Controllers;

use App\Models\PublicScanHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScanHistoryController extends Controller
{
    /**
     * Get paginated scan history with filters
     */
    public function index(Request $request)
    {
        $query = PublicScanHistory::query();

        // Search filter
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'LIKE', "%{$search}%")
                  ->orWhere('student_name', 'LIKE', "%{$search}%")
                  ->orWhere('student_id', 'LIKE', "%{$search}%")
                  ->orWhere('serial_number', 'LIKE', "%{$search}%");
            });
        }

        // Status filter
        if ($status = $request->get('status')) {
            if ($status !== 'all') {
                $query->where('scan_status', $status);
            }
        }

        // Date range filter
        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('scanned_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('scanned_at', '<=', $dateTo);
        }

        // Sort by latest first
        $query->orderBy('scanned_at', 'desc');

        // Paginate
        $perPage = $request->get('per_page', 10);
        $scanHistory = $query->paginate($perPage);

        // Add computed attributes
        $scanHistory->getCollection()->transform(function ($item) {
            $item->browser = $item->browser; // Uses accessor from model
            $item->device = $item->device;   // Uses accessor from model
            return $item;
        });

        return response()->json($scanHistory);
    }

    /**
     * Get scan history statistics
     */
    public function stats()
    {
        $stats = PublicScanHistory::select([
            DB::raw('COUNT(*) as total'),
            DB::raw('COUNT(CASE WHEN scan_status = "success" THEN 1 END) as successful'),
            DB::raw('COUNT(CASE WHEN scan_status = "failed" THEN 1 END) as failed'),
            DB::raw('COUNT(CASE WHEN scan_status = "revoked" THEN 1 END) as revoked'),
            DB::raw('COUNT(CASE WHEN email_sent = 1 THEN 1 END) as emails_sent')
        ])->first();

        return response()->json($stats);
    }

    /**
     * Get detailed information for a specific scan
     */
    public function show($id)
    {
        $scanHistory = PublicScanHistory::findOrFail($id);
        
        // Add computed attributes
        $scanHistory->browser = $scanHistory->browser;
        $scanHistory->device = $scanHistory->device;

        return response()->json($scanHistory);
    }

    /**
     * Export scan history to CSV
     */
    public function export(Request $request)
    {
        $query = PublicScanHistory::query();

        // Apply same filters as index method
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'LIKE', "%{$search}%")
                  ->orWhere('student_name', 'LIKE', "%{$search}%")
                  ->orWhere('student_id', 'LIKE', "%{$search}%")
                  ->orWhere('serial_number', 'LIKE', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            if ($status !== 'all') {
                $query->where('scan_status', $status);
            }
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('scanned_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('scanned_at', '<=', $dateTo);
        }

        $scanHistory = $query->orderBy('scanned_at', 'desc')->get();

        // Create CSV content
        $csvContent = "Date,Email,Student Name,Student ID,Document Type,Serial Number,Status,Email Sent,IP Address,Browser,Device,Failure Reason\n";
        
        foreach ($scanHistory as $record) {
            $csvContent .= sprintf(
                "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                $record->scanned_at->format('Y-m-d H:i:s'),
                $record->email,
                $record->student_name,
                $record->student_id ?? '',
                $record->document_type,
                $record->serial_number,
                $record->scan_status,
                $record->email_sent ? 'Yes' : 'No',
                $record->ip_address,
                $record->browser,
                $record->device,
                $record->failure_reason ?? ''
            );
        }

        $filename = 'scan_history_' . date('Y-m-d_H-i-s') . '.csv';

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Get recent scan activity (for dashboard widgets)
     */
    public function recent()
    {
        $recentScans = PublicScanHistory::with([])
            ->orderBy('scanned_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $item->browser = $item->browser;
                $item->device = $item->device;
                return $item;
            });

        return response()->json($recentScans);
    }
}