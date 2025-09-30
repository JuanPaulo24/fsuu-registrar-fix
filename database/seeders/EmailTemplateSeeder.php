<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        EmailTemplate::truncate();


        $data = [
            [
                'title' => 'VERIFICATION RESULT (SUCCESS)',
                'subject' => 'Document Verification Successful',
                'body' => '<p>Dear [user:name],</p><p><br></p><p>Congratulations! Your document verification has been completed successfully.</p><p><br></p><p>Document Type: [document:type]</p><p>Status: <strong style="color: #28a745;">Verified</strong></p><p>Verification Date: [verification:date]</p><p><br></p><p>Your document has been approved and is now ready for processing. You may proceed with your application or request.</p><p><br></p><p>For any questions, please contact our office.</p>',
                'template_type' => 'verification_result_success',
                'is_active' => true,
                'system_id' => 3,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'VERIFICATION RESULT (REVOKED)',
                'subject' => 'Document Verification - Action Required',
                'body' => '<p>Dear [student:name],</p><p><br></p><p>We regret to inform you that your document verification has been revoked.</p><p><br></p><p><strong>Document Details:</strong></p><p>Document Type: [document:type]</p><p>Status: <strong style="color: #dc3545;">Revoked</strong></p><p>Revocation Date: [document:revocation_date]</p><p>Reason for Revocation: <strong>[document:revocation_reason]</strong></p><p><br></p><p>Please contact our office immediately to resolve this matter. You may need to resubmit your documents with the necessary corrections or additional supporting materials.</p><p><br></p><p><strong>Important:</strong> This action may affect your current applications or requests. Please address this issue promptly.</p><p><br></p><p>For immediate assistance, please contact our office during business hours.</p>',
                'template_type' => 'verification_result_revoked',
                'is_active' => true,
                'system_id' => 3,
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        EmailTemplate::insert($data);
    }
}
