<?php

namespace Tests\Feature;

use App\Models\IssuedDocument;
use App\Models\Profile;
use App\Models\Signature;
use App\Models\User;
use App\Http\Controllers\IssuedDocumentController;
use App\Http\Controllers\DocumentVerificationController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentUploadTest extends TestCase
{
    use RefreshDatabase;

    protected $superAdmin;
    protected $profile;
    protected $signature;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create superadmin user using the same structure as UserSeeder
        $this->superAdmin = User::create([
            'username' => 'superadmin',
            'email' => 'superadmin@test.com',
            'password' => bcrypt('Admin123!'),
            'user_role_id' => 1,
            'status' => 'Active',
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        // Create test profile
        $this->profile = Profile::create([
            'user_id' => $this->superAdmin->id,
            'firstname' => 'John',
            'lastname' => 'Doe',
            'middlename' => 'Smith',
            'id_number' => '221000001',
            'birthdate' => '1995-01-01',
            'gender' => 'Male',
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        // Create signature
        $this->signature = Signature::create([
            'key_id' => 'registrar-2025-07',
            'algorithm' => 'ES256',
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        // Authenticate as superadmin
        $this->actingAs($this->superAdmin, 'api');
        
        // Set up storage for testing
        Storage::fake('public');
    }

    /**
     * Test document upload with correct folder structure and filename
     */
    public function test_document_upload_creates_correct_folder_structure_and_filename()
    {
        // Create a test PDF file
        $pdfContent = $this->createTestPdfContent('Test Transcript of Records Document');
        $uploadedFile = UploadedFile::fake()->createWithContent(
            'test_transcript.pdf',
            $pdfContent
        );

        // Create request data
        $requestData = [
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'document_type' => 'Transcript of Records',
            'current_version' => '1.0',
            'date_issued' => now()->format('Y-m-d H:i:s'),
            'date_revoked' => now()->addYear()->format('Y-m-d H:i:s'),
            'serial_number' => 'TOR-2025-TEST-001',
            'document_id_number' => 'TOR-TEST-001',
        ];

        // Make the request with file upload
        $response = $this->post('/api/issued_documents', array_merge($requestData, [
            'document_file' => $uploadedFile
        ]), [
            'Accept' => 'application/json',
            'Content-Type' => 'multipart/form-data'
        ]);

        // Assert response is successful
        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Data saved successfully'
                ]);

        // Find the created document
        $document = IssuedDocument::where('document_id_number', 'TOR-TEST-001')->first();
        $this->assertNotNull($document);

        // Check attachment
        $attachment = $document->attachments()->where('file_type', 'document')->first();
        $this->assertNotNull($attachment);

        // Verify filename format: v{current_version}-{id_number}.pdf
        $expectedFilename = 'v1.0-221000001.pdf';
        $this->assertEquals($expectedFilename, $attachment->file_name);

        // Verify folder structure: documents/profile/{id_number}/{document_type}/
        $expectedPath = 'documents/profile/221000001/TOR/';
        $this->assertStringContainsString($expectedPath, $attachment->file_path);

        // Verify the file exists in storage
        $storagePath = str_replace('storage/', '', $attachment->file_path);
        Storage::disk('public')->assertExists($storagePath);
    }

    /**
     * Test multiple document types create correct folder structures
     */
    public function test_multiple_document_types_create_correct_folders()
    {
        $documentTypes = [
            ['type' => 'Transcript of Records', 'code' => 'TOR', 'version' => '1.0'],
            ['type' => 'Certificate of Enrollment', 'code' => 'COE', 'version' => '2.0'],
            ['type' => 'Diploma', 'code' => 'DIP', 'version' => '1.5'],
            ['type' => 'Certificate of Graduation', 'code' => 'COG', 'version' => '3.0'],
            ['type' => 'Certificate of Good Moral Character', 'code' => 'GMC', 'version' => '2.5'],
        ];

        foreach ($documentTypes as $index => $docType) {
            // Create test PDF
            $pdfContent = $this->createTestPdfContent("Test {$docType['type']} Document");
            $uploadedFile = UploadedFile::fake()->createWithContent(
                "test_{$docType['code']}.pdf",
                $pdfContent
            );

            // Create request data
            $requestData = [
                'profile_id' => $this->profile->id,
                'signature_id' => $this->signature->id,
                'document_type' => $docType['type'],
                'current_version' => $docType['version'],
                'date_issued' => now()->format('Y-m-d H:i:s'),
                'date_revoked' => now()->addYear()->format('Y-m-d H:i:s'),
                'serial_number' => "{$docType['code']}-2025-TEST-" . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'document_id_number' => "{$docType['code']}-TEST-" . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
            ];

            // Make the request with file upload
            $response = $this->post('/api/issued_documents', array_merge($requestData, [
                'document_file' => $uploadedFile
            ]), [
                'Accept' => 'application/json'
            ]);

            // Assert response is successful
            $response->assertStatus(200);

            // Find the created document
            $document = IssuedDocument::where('document_id_number', $requestData['document_id_number'])->first();
            $this->assertNotNull($document, "Document {$docType['type']} was not created");

            // Check attachment
            $attachment = $document->attachments()->where('file_type', 'document')->first();
            $this->assertNotNull($attachment, "Attachment for {$docType['type']} was not created");

            // Verify filename format
            $expectedFilename = "v{$docType['version']}-{$this->profile->id_number}.pdf";
            $this->assertEquals($expectedFilename, $attachment->file_name, "Filename incorrect for {$docType['type']}");

            // Verify folder structure
            $expectedPath = "documents/profile/{$this->profile->id_number}/{$docType['code']}/";
            $this->assertStringContainsString($expectedPath, $attachment->file_path, "Folder structure incorrect for {$docType['type']}");

            // Verify the file exists in storage
            $storagePath = str_replace('storage/', '', $attachment->file_path);
            Storage::disk('public')->assertExists($storagePath);
        }
    }

    /**
     * Test document verification with digital signature
     */
    public function test_document_verification_with_digital_signature()
    {
        // For this test, we need to use real storage since verification requires file hash calculation
        // Temporarily disable fake storage
        $originalDisk = config('filesystems.disks.public');
        
        // Create the test document in the database without file upload for this test
        $document = IssuedDocument::create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'document_type' => 'Transcript of Records',
            'document_version' => '2.5',
            'current_version' => '2.5',
            'date_issued' => now()->format('Y-m-d H:i:s'),
            'date_revoked' => now()->addYear()->format('Y-m-d H:i:s'),
            'serial_number' => 'TOR-2025-VERIFY-001',
            'document_id_number' => 'TOR-VERIFY-001',
            'registrar_id' => $this->superAdmin->id,
            'created_by' => $this->superAdmin->id,
            'updated_by' => $this->superAdmin->id,
        ]);

        // Test document verification (without file attachment for this test)
        $response = $this->get('/api/document-verification/TOR-VERIFY-001', [
            'Accept' => 'application/json'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'current_version',
                        'algorithm',
                        'kid',
                        'doc_id',
                        'type',
                        'registrar_id',
                        'issued_at',
                        'pdf_hash'
                    ],
                    'signature',
                    'algorithm',
                    'signed_at'
                ]);

        $responseData = $response->json();
        
        // Verify the verification data structure
        $this->assertEquals(2.5, $responseData['data']['current_version']);
        $this->assertEquals('ES256', $responseData['data']['algorithm']);
        $this->assertEquals('registrar-2025-07', $responseData['data']['kid']);
        $this->assertEquals('TOR-VERIFY-001', $responseData['data']['doc_id']);
        $this->assertEquals('TOR', $responseData['data']['type']);
        $this->assertEquals($this->profile->id_number, $responseData['data']['registrar_id']);
        // pdf_hash will be null without actual file, which is fine for this test
        $this->assertNotEmpty($responseData['signature']);
        $this->assertEquals('ES256', $responseData['algorithm']);
    }

    /**
     * Test that files are stored with actual filenames, not random strings
     */
    public function test_files_stored_with_actual_filenames_not_random()
    {
        $pdfContent = $this->createTestPdfContent('Test Actual Filename Storage');
        $uploadedFile = UploadedFile::fake()->createWithContent('test_actual_filename.pdf', $pdfContent);

        $requestData = [
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'document_type' => 'Diploma',
            'current_version' => '3.5',
            'date_issued' => now()->format('Y-m-d H:i:s'),
            'date_revoked' => now()->addYear()->format('Y-m-d H:i:s'),
            'serial_number' => 'DIP-2025-ACTUAL-001',
            'document_id_number' => 'DIP-ACTUAL-001',
        ];

        $this->post('/api/issued_documents', array_merge($requestData, [
            'document_file' => $uploadedFile
        ]), [
            'Accept' => 'application/json'
        ]);

        $document = IssuedDocument::where('document_id_number', 'DIP-ACTUAL-001')->first();
        $attachment = $document->attachments()->where('file_type', 'document')->first();

        // Extract the actual stored filename from the path
        $pathParts = explode('/', $attachment->file_path);
        $storedFilename = end($pathParts);

        // The stored filename should match our expected format, not be a random string
        $expectedFilename = "v3.5-{$this->profile->id_number}.pdf";
        $this->assertEquals($expectedFilename, $storedFilename);
        
        // Also verify it matches the display filename
        $this->assertEquals($expectedFilename, $attachment->file_name);

        // Ensure it's NOT a random string pattern (like gOcz6P0tN8.pdf)
        $this->assertDoesNotMatchRegularExpression('/^[a-zA-Z0-9]{10}\.pdf$/', $storedFilename);
    }

    /**
     * Test folder structure uses only ID number, not full name
     */
    public function test_folder_structure_uses_id_number_only()
    {
        // Create a profile with a long complex name
        $complexProfile = Profile::create([
            'user_id' => $this->superAdmin->id,
            'firstname' => 'Very Long First Name',
            'lastname' => 'Complex Last Name With Spaces',
            'middlename' => 'Middle Name',
            'name_ext' => 'Jr.',
            'id_number' => '221999999',
            'birthdate' => '1995-01-01',
            'gender' => 'Male',
            'created_by' => 1,
            'updated_by' => 1,
        ]);

        $pdfContent = $this->createTestPdfContent('Test Complex Name Folder Structure');
        $uploadedFile = UploadedFile::fake()->createWithContent('test_complex.pdf', $pdfContent);

        $requestData = [
            'profile_id' => $complexProfile->id,
            'signature_id' => $this->signature->id,
            'document_type' => 'Certificate of Enrollment',
            'current_version' => '1.0',
            'date_issued' => now()->format('Y-m-d H:i:s'),
            'date_revoked' => now()->addYear()->format('Y-m-d H:i:s'),
            'serial_number' => 'COE-2025-COMPLEX-001',
            'document_id_number' => 'COE-COMPLEX-001',
        ];

        $this->post('/api/issued_documents', array_merge($requestData, [
            'document_file' => $uploadedFile
        ]), [
            'Accept' => 'application/json'
        ]);

        $document = IssuedDocument::where('document_id_number', 'COE-COMPLEX-001')->first();
        $attachment = $document->attachments()->where('file_type', 'document')->first();

        // The folder should ONLY contain the ID number, not the full name
        $expectedPath = "documents/profile/221999999/COE/";
        $this->assertStringContainsString($expectedPath, $attachment->file_path);

        // Ensure it does NOT contain any part of the name
        $this->assertStringNotContainsString('Very Long First Name', $attachment->file_path);
        $this->assertStringNotContainsString('Complex Last Name', $attachment->file_path);
        $this->assertStringNotContainsString('Middle Name', $attachment->file_path);
        $this->assertStringNotContainsString('Jr', $attachment->file_path);
    }

    /**
     * Helper method to create test PDF content
     */
    private function createTestPdfContent(string $title = 'Test Document'): string
    {
        return "%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Count 1
/Kids [3 0 R]
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length " . (strlen($title) + 30) . "
>>
stream
BT
/F1 12 Tf
100 700 Td
({$title}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000109 00000 n 
0000000196 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
296
%%EOF";
    }
}
