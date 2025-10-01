<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('api.access')->group(function () {



Route::get('public/postings', [App\Http\Controllers\PostingController::class, 'getPublicPostings']);


Route::get('public/document-verification/{documentId}', [App\Http\Controllers\DocumentVerificationController::class, 'verifyDocument']);
Route::get('public/document-verification/details/{documentId}', [App\Http\Controllers\DocumentVerificationController::class, 'getDocumentDetails']);
Route::post('public/document-verification/validate-qr', [App\Http\Controllers\DocumentVerificationController::class, 'validateQRCode']);
Route::post('public/document-verification/verify-hash', [App\Http\Controllers\DocumentVerificationController::class, 'verifyHashAndGetBase45']);
Route::post('public/document-verification/verify-with-details', [App\Http\Controllers\DocumentVerificationController::class, 'verifyWithDetails']);


Route::post('login', [App\Http\Controllers\AuthController::class, 'login']);
Route::post('forgot-password', [App\Http\Controllers\AuthController::class, 'forgotPassword']);

Route::middleware('auth:api')->group(function () {
    // Scan History Management
    Route::get('scan-history', [App\Http\Controllers\ScanHistoryController::class, 'index']);
    Route::get('scan-history/stats', [App\Http\Controllers\ScanHistoryController::class, 'stats']);
    Route::get('scan-history/export', [App\Http\Controllers\ScanHistoryController::class, 'export']);
    Route::get('scan-history/recent', [App\Http\Controllers\ScanHistoryController::class, 'recent']);
    Route::get('scan-history/{id}', [App\Http\Controllers\ScanHistoryController::class, 'show']);
    
    Route::get('check_auth_status', [App\Http\Controllers\AuthController::class, "check_auth_status"]);
    Route::get('refresh_user_data', [App\Http\Controllers\AuthController::class, "refresh_user_data"]);
    Route::post('logout', [App\Http\Controllers\AuthController::class, 'logout']);

    // UserController
    Route::post('existing_username', [App\Http\Controllers\UserController::class, "existing_username"]);

    Route::post('multiple_archived_user', [App\Http\Controllers\UserController::class, "multiple_archived_user"]);
    Route::post('user_profile_photo_update', [App\Http\Controllers\UserController::class, "user_profile_photo_update"]);
    Route::get('user_profile_info', [App\Http\Controllers\UserController::class, "user_profile_info"]);
    Route::post('user_profile_info_update', [App\Http\Controllers\UserController::class, "user_profile_info_update"]);
    Route::post('user_update_role', [App\Http\Controllers\UserController::class, "user_update_role"]);
    Route::post('user_deactivate', [App\Http\Controllers\UserController::class, "user_deactivate"]);
    Route::post('user_reactivate', [App\Http\Controllers\UserController::class, "user_reactivate"]);
    Route::post('users_update_email', [App\Http\Controllers\UserController::class, "users_update_email"]);
    Route::post('users_update_password', [App\Http\Controllers\UserController::class, "users_update_password"]);
    Route::post('users_info_update_password', [App\Http\Controllers\UserController::class, "users_info_update_password"]);
    Route::post('add_user', [App\Http\Controllers\UserController::class, "add_user"]);
    Route::apiResource('users', App\Http\Controllers\UserController::class);
    // Get user's profile by user UUID
    Route::get('users/{user}/profile', [App\Http\Controllers\UserController::class, 'getUserProfile']);
    // END UserController

    // UserPermissionController
    Route::post('user_permission_status', [App\Http\Controllers\UserPermissionController::class, 'user_permission_status']);
    Route::apiResource('user_permission', App\Http\Controllers\UserPermissionController::class);
    // END UserPermissionController

    // ModuleController
    Route::post('module_multi_update_permission_status', [App\Http\Controllers\ModuleController::class, 'module_multi_update_permission_status']);
    Route::post('module_update_permission_status', [App\Http\Controllers\ModuleController::class, 'module_update_permission_status']);
    Route::apiResource('module', App\Http\Controllers\ModuleController::class);
    // END ModuleController

    // UserRoleController
    Route::post('role_archived', [App\Http\Controllers\UserRoleController::class, "role_archived"]);
    Route::get('user-roles/{id}/usage-check', [App\Http\Controllers\UserRoleController::class, "usageCheck"]);
    Route::apiResource('user_role', App\Http\Controllers\UserRoleController::class);
    Route::apiResource('user_roles', App\Http\Controllers\UserRoleController::class);
    // END UserRoleController

    // UserRolePermissionController
    Route::apiResource('user_role_permission', App\Http\Controllers\UserRolePermissionController::class);
    Route::post('user_role_permission/batch', [App\Http\Controllers\UserRolePermissionController::class, 'batchUpdate']);
    // END UserRolePermissionController

    // EmailTemplateController
    Route::post('email_template_multiple', [App\Http\Controllers\EmailTemplateController::class, 'email_template_multiple']);
    Route::post('email_template/send_test', [App\Http\Controllers\EmailTemplateController::class, 'sendTestEmail']);
    Route::get('email_template/types', [App\Http\Controllers\EmailTemplateController::class, 'getTemplateTypes']);
    Route::apiResource('email_template', App\Http\Controllers\EmailTemplateController::class);
    // END EmailTemplateController

    // DefaultBannerController
    Route::get('default_banners', [App\Http\Controllers\DefaultBannerController::class, 'index']);
    Route::post('default_banners', [App\Http\Controllers\DefaultBannerController::class, 'store']);
    // END DefaultBannerController

    // NotificationTemplateController
    Route::post('notification_template_multiple', [App\Http\Controllers\NotificationTemplateController::class, 'notification_template_multiple']);
    Route::apiResource('notification_template', App\Http\Controllers\NotificationTemplateController::class);
    // END NotificationTemplateController

    // ProfileController
    Route::post('faculty_upload_excel', [App\Http\Controllers\ProfileController::class, "faculty_upload_excel"]);
    Route::post('student_subject_upload_excel', [App\Http\Controllers\ProfileController::class, "student_subject_upload_excel"]);
    Route::post('upload_signature', [App\Http\Controllers\ProfileController::class, "upload_signature"]);
    Route::post('profile_update', [App\Http\Controllers\ProfileController::class, "profile_update"]);
    Route::post('profile_deactivate', [App\Http\Controllers\ProfileController::class, "profile_deactivate"]);
    Route::post('profile_data_consent', [App\Http\Controllers\ProfileController::class, "profile_data_consent"]);
    Route::post('update_profile_photo', [App\Http\Controllers\ProfileController::class, "update_profile_photo"]);
    Route::post('profile_archived', [App\Http\Controllers\ProfileController::class, "profile_archived"]);
    Route::apiResource('profile', App\Http\Controllers\ProfileController::class);

    Route::apiResource('profile_address', App\Http\Controllers\ProfileAddressController::class);
    // END ProfileController

    // CourseController
    Route::apiResource('courses', App\Http\Controllers\CourseController::class);
    Route::post('course_archived', [App\Http\Controllers\CourseController::class, "service_type_archived"]);
    Route::get('courses/{id}/usage-check', [App\Http\Controllers\CourseController::class, "usageCheck"]);
    // END CourseController

    // PositionController - REMOVED: Now using UserRole instead
    // Route::apiResource('positions', App\Http\Controllers\PositionController::class);
    // Route::post('position_archived', [App\Http\Controllers\PositionController::class, "position_archived"]);
    // END PositionController

    // LoginLogController
    Route::apiResource('login_logs', App\Http\Controllers\LoginLogController::class)->only(['index']);
    // END LoginLogController

    // StudentExamQrController

    // END StudentExamQrController

    Route::apiResource('notifications', App\Http\Controllers\NotificationController::class);
    Route::post('update_notification', [App\Http\Controllers\NotificationUserController::class, 'update_notification']);
    Route::apiResource('user_notifications', App\Http\Controllers\NotificationUserController::class);

    Route::apiResource('citizenship', App\Http\Controllers\RefCitizenshipController::class);
    Route::post('citizenship_archived', [App\Http\Controllers\RefCitizenshipController::class, "citizenship_archived"]);

    Route::apiResource('civil_status', App\Http\Controllers\RefCivilStatusController::class);
    Route::post('civil_status_archived', [App\Http\Controllers\RefCivilStatusController::class, "civil_status_archived"]);

    Route::apiResource('religion', App\Http\Controllers\RefReligionController::class);
    Route::post('religion_archived', [App\Http\Controllers\RefReligionController::class, "religion_archived"]);



    Route::apiResource('service_type', App\Http\Controllers\ServiceTypeController::class);
    Route::post('service_type_archived', [App\Http\Controllers\ServiceTypeController::class, "service_type_archived"]);




    Route::apiResource('posting', App\Http\Controllers\PostingController::class);
    Route::post('posting_archived', [App\Http\Controllers\PostingController::class, "posting_archived"]);
    
    Route::apiResource('calendar', App\Http\Controllers\CalendarController::class);
    Route::post('calendar_archived', [App\Http\Controllers\CalendarController::class, "calendar_archived"]);

    Route::apiResource('calendar', App\Http\Controllers\CalendarController::class);
    Route::post('calendar_archived', [App\Http\Controllers\CalendarController::class, "calendar_archived"]);

    // IssuedDocumentController - Custom routes first (before apiResource to avoid conflicts)
    Route::post('issued_documents/generate_serial', [App\Http\Controllers\IssuedDocumentController::class, "generateSerial"]);
    Route::post('issued_documents/generate_certificate_serial', [App\Http\Controllers\IssuedDocumentController::class, "generateCertificateSerial"]);
    Route::post('issued-documents/generate-diploma-serial', [App\Http\Controllers\IssuedDocumentController::class, "generateDiplomaSerial"]);
    Route::post('issued_documents/save_pdf', [App\Http\Controllers\IssuedDocumentController::class, "savePDF"]);
    Route::post('issued_documents/generate_tor', [App\Http\Controllers\IssuedDocumentController::class, "generateTORDocument"]);
    Route::post('issued_documents/generate_certificate', [App\Http\Controllers\IssuedDocumentController::class, "generateCertificateDocument"]);
    Route::post('issued_documents/generate_diploma', [App\Http\Controllers\IssuedDocumentController::class, "generateDiplomaDocument"]);
    Route::post('issued_documents/save_final_pdf', [App\Http\Controllers\IssuedDocumentController::class, "saveFinalPDF"]);
    Route::post('issued_documents/archive', [App\Http\Controllers\IssuedDocumentController::class, "issued_document_archived"]);
Route::post('issued_documents/revoke', [App\Http\Controllers\IssuedDocumentController::class, "revokeDocument"]);
    Route::post('issued_documents/verify_hash', [App\Http\Controllers\IssuedDocumentController::class, "verifyDocumentByHash"]);

    // Email mention routes
    Route::get('email-mentions/suggestions', [App\Http\Controllers\EmailMentionController::class, 'getEmailSuggestions']);
    Route::get('email-mentions/users-by-role', [App\Http\Controllers\EmailMentionController::class, 'getAllUsersByRole']);
    Route::post('email-mentions/expand', [App\Http\Controllers\EmailMentionController::class, 'expandMention']);
Route::post('issued_document_delete', [App\Http\Controllers\IssuedDocumentController::class, "destroy"]);
    Route::post('verify_password', [App\Http\Controllers\AuthController::class, "verifyPassword"]);
    
    // Standard REST routes for issued_documents
    Route::apiResource('issued_documents', App\Http\Controllers\IssuedDocumentController::class);
    // END IssuedDocumentController

    // DocumentVerificationController
    Route::get('document-verification/list', [App\Http\Controllers\DocumentVerificationController::class, "listVerifiableDocuments"]);
    Route::post('document-verification/decode-qr', [App\Http\Controllers\DocumentVerificationController::class, "decodeQRCode"]);
    Route::post('document-verification/verify-hash', [App\Http\Controllers\DocumentVerificationController::class, "verifyHashAndGetBase45"]);
    Route::get('document-verification/scan-history', [App\Http\Controllers\DocumentVerificationController::class, "getScanHistory"]);
    Route::get('document-verification/{documentId}', [App\Http\Controllers\DocumentVerificationController::class, "verifyDocument"]);
    Route::get('document-verification/status/check', [App\Http\Controllers\DocumentVerificationController::class, "getVerificationStatus"]);
    Route::get('document-verification/details/{documentId}', [App\Http\Controllers\DocumentVerificationController::class, "getDocumentDetails"]);
    // END DocumentVerificationController

    // SystemConfigurationController
    Route::prefix('system-configuration')->group(function () {
        Route::get('/', [App\Http\Controllers\SystemConfigurationController::class, 'index']);
        Route::post('/', [App\Http\Controllers\SystemConfigurationController::class, 'update']);
        
        // Roles management
        Route::get('roles', [App\Http\Controllers\SystemConfigurationController::class, 'getRoles']);
        Route::post('roles', [App\Http\Controllers\SystemConfigurationController::class, 'createRole']);
        Route::put('roles/{id}', [App\Http\Controllers\SystemConfigurationController::class, 'updateRole']);
        Route::delete('roles/{id}', [App\Http\Controllers\SystemConfigurationController::class, 'deleteRole']);
        
        // Permissions management
        Route::get('permissions', [App\Http\Controllers\SystemConfigurationController::class, 'getPermissions']);
        Route::put('roles/{id}/permissions', [App\Http\Controllers\SystemConfigurationController::class, 'updateRolePermissions']);
        
        // Academic years management
        Route::get('academic-years', [App\Http\Controllers\SystemConfigurationController::class, 'getAcademicYears']);
        Route::post('academic-years', [App\Http\Controllers\SystemConfigurationController::class, 'createAcademicYear']);
    });
    // END SystemConfigurationController

// Gmail API routes
Route::prefix('gmail')->group(function () {
    Route::get('inbox', [App\Http\Controllers\GmailController::class, 'getInbox']);
    Route::get('sent', [App\Http\Controllers\GmailController::class, 'getSent']);
    Route::get('drafts', [App\Http\Controllers\GmailController::class, 'getDrafts']);
    Route::get('archive', [App\Http\Controllers\GmailController::class, 'getArchive']);
    Route::get('deleted', [App\Http\Controllers\GmailController::class, 'getDeleted']);
    Route::get('spam', [App\Http\Controllers\GmailController::class, 'getSpam']);
    Route::get('new-emails', [App\Http\Controllers\GmailController::class, 'getNewEmails']);
        Route::post('send', [App\Http\Controllers\GmailController::class, 'sendEmail']);
        Route::post('save-draft', [App\Http\Controllers\GmailController::class, 'saveDraft']);
        Route::post('mark-spam/{messageId}', [App\Http\Controllers\GmailController::class, 'markAsSpam']);
        Route::post('report-not-spam/{messageId}', [App\Http\Controllers\GmailController::class, 'reportNotSpam']);
        Route::post('archive/{messageId}', [App\Http\Controllers\GmailController::class, 'archiveEmail']);
        Route::delete('delete/{messageId}', [App\Http\Controllers\GmailController::class, 'deleteEmail']);
        Route::get('attachment/{messageId}/{attachmentId}', [App\Http\Controllers\GmailController::class, 'downloadAttachment']);
        Route::get('status', function() {
            $gmailService = app(\App\Services\GmailService::class);
            return response()->json([
                'success' => true,
                'gmail_ready' => $gmailService->isReady(),
                'timestamp' => now()
            ]);
        });
        // Real-time email monitoring endpoint (for testing)
        Route::post('trigger-monitor', [App\Http\Controllers\GmailController::class, 'triggerMonitoring']);
    });
    // END Gmail API routes

    // Real-time status management
    Route::post('set-realtime-status', [App\Http\Controllers\GmailController::class, 'setRealtimeStatus']);

    // Messaging API routes
    Route::prefix('messages')->group(function () {
        Route::get('conversations', [App\Http\Controllers\MessageController::class, 'getConversations']);
        Route::get('conversations/{conversationId}/messages', [App\Http\Controllers\MessageController::class, 'getMessages']);
        Route::post('send', [App\Http\Controllers\MessageController::class, 'sendMessage']);
        Route::post('conversations/start', [App\Http\Controllers\MessageController::class, 'startConversation']);
        Route::get('users', [App\Http\Controllers\MessageController::class, 'getUsers']);
    });
    // END Messaging API routes

    // Global Search API routes
    Route::prefix('search')->group(function () {
        Route::get('/', [App\Http\Controllers\GlobalSearchController::class, 'search']);
        Route::get('suggestions', [App\Http\Controllers\GlobalSearchController::class, 'suggestions']);
    });
    // END Global Search API routes

    // Debug broadcasting auth
    Route::post('debug/broadcasting/auth', function(\Illuminate\Http\Request $request) {
        try {
            \Log::info('🔍 Debug auth request:', [
                'headers' => $request->headers->all(),
                'body' => $request->all(),
                'user' => \Auth::user() ? \Auth::user()->id : 'not authenticated'
            ]);
            
            if (!\Auth::check()) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }
            
            return response()->json(['success' => true, 'user_id' => \Auth::id()]);
        } catch (\Exception $e) {
            \Log::error('🔍 Debug auth error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
    
});
