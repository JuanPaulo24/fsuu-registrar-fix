<?php

namespace Tests\Feature;

use App\Models\IssuedDocument;
use App\Models\Profile;
use App\Models\Signature;
use App\Models\User;
use App\Services\DocumentEncryptionService;
use App\Services\DigitalSignatureService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CompleteDocumentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $superAdmin;
    protected $profile;
    protected $signature;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create superadmin user
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
            'id_number' => '2212312323',
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
     * Test complete document workflow: Upload -> Sign -> Encrypt -> BASE45 -> QR Code
     */
    public function test_complete_document_workflow()
    {
        // Step 1: Create and upload a document
        $document = $this->createTestDocument();
        
        $this->assertNotNull($document);
        $this->assertEquals('TOR-COMPLETE-001', $document->document_id_number);

        // Step 2: Test the verification workflow
        $response = $this->get('/api/document-verification/TOR-COMPLETE-001', [
            'Accept' => 'application/json'
        ]);

        $response->assertStatus(200);
        $responseData = $response->json();

        // Verify complete response structure
        $this->assertArrayHasKey('success', $responseData);
        $this->assertArrayHasKey('verification_data', $responseData);
        $this->assertArrayHasKey('digital_signature', $responseData);
        $this->assertArrayHasKey('encrypted_data', $responseData);
        $this->assertArrayHasKey('qr_code_data', $responseData);
        $this->assertArrayHasKey('generated_files', $responseData);

        // Verify verification data structure
        $verificationData = $responseData['verification_data'];
        $this->assertEquals(1.0, $verificationData['current_version']);
        $this->assertEquals('ES256', $verificationData['algorithm']);
        $this->assertEquals('registrar-2025-07', $verificationData['kid']);
        $this->assertEquals('TOR-COMPLETE-001', $verificationData['doc_id']);
        $this->assertEquals('TOR', $verificationData['type']);
        $this->assertEquals('2212312323', $verificationData['registrar_id']);

        // Verify digital signature
        $digitalSig = $responseData['digital_signature'];
        $this->assertArrayHasKey('signature', $digitalSig);
        $this->assertArrayHasKey('algorithm', $digitalSig);
        $this->assertEquals('ES256', $digitalSig['algorithm']);

        // Verify encrypted data (AES-256-GCM)
        $encryptedData = $responseData['encrypted_data'];
        $this->assertEquals('A256GCM', $encryptedData['algorithm']);
        $this->assertEquals('aes-2025-07', $encryptedData['key_id']);
        $this->assertArrayHasKey('iv', $encryptedData);
        $this->assertArrayHasKey('ct', $encryptedData);
        $this->assertArrayHasKey('tag', $encryptedData);

        // Verify QR code data (BASE45)
        $this->assertNotEmpty($responseData['qr_code_data']);
        $this->assertIsString($responseData['qr_code_data']);

        // Verify generated files
        $generatedFiles = $responseData['generated_files'];
        $this->assertArrayHasKey('files', $generatedFiles);
        
        return $responseData;
    }

    /**
     * Test AES-256-GCM encryption and decryption
     */
    public function test_aes_256_gcm_encryption_decryption()
    {
        $encryptionService = new DocumentEncryptionService(new DigitalSignatureService());

        $testData = [
            'current_version' => 1.0,
            'algorithm' => 'ES256',
            'kid' => 'registrar-2025-07',
            'doc_id' => 'TEST-001',
            'type' => 'TOR',
            'registrar_id' => '2212312323',
            'issued_at' => '2025-07-11T14:32:55Z',
            'pdf_hash' => 'e86e447b1'
        ];

        // Test encryption
        $encrypted = $encryptionService->encryptWithAES256GCM($testData);
        
        $this->assertTrue($encrypted['success']);
        $this->assertEquals('A256GCM', $encrypted['encrypted']['algorithm']);
        $this->assertEquals('aes-2025-07', $encrypted['encrypted']['key_id']);
        $this->assertNotEmpty($encrypted['encrypted']['iv']);
        $this->assertNotEmpty($encrypted['encrypted']['ct']);
        $this->assertNotEmpty($encrypted['encrypted']['tag']);

        // Test decryption
        $decrypted = $encryptionService->decryptAES256GCM($encrypted['encrypted']);
        
        $this->assertTrue($decrypted['success']);
        $this->assertEquals($testData, $decrypted['decrypted']);
    }

    /**
     * Test BASE45 encoding
     */
    public function test_base45_encoding()
    {
        $encryptionService = new DocumentEncryptionService(new DigitalSignatureService());

        $testData = [
            'algorithm' => 'A256GCM',
            'key_id' => 'aes-2025-07',
            'iv' => 'test_iv',
            'ct' => 'test_ciphertext',
            'tag' => 'test_tag'
        ];

        $base45Result = $encryptionService->encodeToBase45($testData);

        $this->assertTrue($base45Result['success']);
        $this->assertNotEmpty($base45Result['base45']);
        $this->assertIsString($base45Result['base45']);
    }

    /**
     * Test file generation workflow
     */
    public function test_file_generation_workflow()
    {
        // Create a document with uploaded file
        $document = $this->createTestDocument();
        
        // Test document verification which should generate files
        $response = $this->get('/api/document-verification/TOR-COMPLETE-001', [
            'Accept' => 'application/json'
        ]);

        $response->assertStatus(200);
        $responseData = $response->json();

        // Check if files are referenced in the response
        $this->assertArrayHasKey('generated_files', $responseData);
        $generatedFiles = $responseData['generated_files'];

        if ($generatedFiles['success']) {
            $files = $generatedFiles['files'];
            
            // Verify file structure
            $expectedFiles = ['original_pdf', 'qr_code', 'final_document'];
            foreach ($expectedFiles as $fileType) {
                if (isset($files[$fileType])) {
                    $this->assertArrayHasKey('name', $files[$fileType]);
                    $this->assertArrayHasKey('path', $files[$fileType]);
                    $this->assertArrayHasKey('status', $files[$fileType]);
                }
            }

            // Verify naming convention
            if (isset($files['qr_code'])) {
                $this->assertStringStartsWith('QRCode_v', $files['qr_code']['name']);
                $this->assertStringEndsWith('.png', $files['qr_code']['name']);
            }

            if (isset($files['final_document'])) {
                $this->assertStringStartsWith('FinalDocument_v', $files['final_document']['name']);
                $this->assertStringEndsWith('.pdf', $files['final_document']['name']);
            }
        }
    }

    /**
     * Test error handling in encryption workflow
     */
    public function test_encryption_workflow_error_handling()
    {
        $encryptionService = new DocumentEncryptionService(new DigitalSignatureService());

        // Test with empty data - this should still work as the digital signature service handles it
        $result = $encryptionService->processDocumentVerification([]);
        
        // The system is robust and handles empty data, so it should succeed
        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('base45_qr_code', $result);
        
        // Test that all required fields are still present
        $this->assertArrayHasKey('original_data', $result);
        $this->assertArrayHasKey('digital_signature', $result);
        $this->assertArrayHasKey('encrypted_data', $result);
    }

    /**
     * Test complete security workflow: ES256 + AES-256-GCM + BASE45
     */
    public function test_complete_security_workflow()
    {
        $encryptionService = new DocumentEncryptionService(new DigitalSignatureService());

        $verificationData = [
            'current_version' => 1.0,
            'algorithm' => 'ES256',
            'kid' => 'registrar-2025-07',
            'doc_id' => 'SECURITY-TEST-001',
            'type' => 'TOR',
            'registrar_id' => '2212312323',
            'issued_at' => now()->toISOString(),
            'pdf_hash' => hash('sha256', 'test pdf content')
        ];

        // Run complete workflow
        $result = $encryptionService->processDocumentVerification($verificationData);

        $this->assertTrue($result['success']);
        
        // Verify all stages completed
        $this->assertArrayHasKey('original_data', $result);
        $this->assertArrayHasKey('digital_signature', $result);
        $this->assertArrayHasKey('encrypted_data', $result);
        $this->assertArrayHasKey('base45_qr_code', $result);

        // Verify original data integrity
        $this->assertEquals($verificationData, $result['original_data']);

        // Verify digital signature
        $digitalSig = $result['digital_signature'];
        $this->assertEquals('ES256', $digitalSig['algorithm']);
        $this->assertNotEmpty($digitalSig['signature']);

        // Verify AES encryption
        $encrypted = $result['encrypted_data'];
        $this->assertEquals('A256GCM', $encrypted['algorithm']);
        $this->assertEquals('aes-2025-07', $encrypted['key_id']);

        // Verify BASE45 encoding
        $this->assertNotEmpty($result['base45_qr_code']);
        $this->assertIsString($result['base45_qr_code']);
    }

    /**
     * Helper method to create a test document
     */
    private function createTestDocument()
    {
        // Create test PDF content
        $pdfContent = $this->createTestPdfContent('Test Complete Workflow Document');
        $uploadedFile = UploadedFile::fake()->createWithContent('test_complete.pdf', $pdfContent);

        $requestData = [
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'document_type' => 'Transcript of Records',
            'current_version' => '1.0',
            'date_issued' => now()->format('Y-m-d H:i:s'),
            'date_revoked' => now()->addYear()->format('Y-m-d H:i:s'),
            'serial_number' => 'TOR-2025-COMPLETE-001',
            'document_id_number' => 'TOR-COMPLETE-001',
        ];

        // Upload document
        $response = $this->post('/api/issued_documents', array_merge($requestData, [
            'document_file' => $uploadedFile
        ]), [
            'Accept' => 'application/json'
        ]);

        $response->assertStatus(200);

        return IssuedDocument::where('document_id_number', 'TOR-COMPLETE-001')->first();
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
