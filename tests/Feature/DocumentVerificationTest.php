<?php

namespace Tests\Feature;

use App\Models\IssuedDocument;
use App\Models\Profile;
use App\Models\Signature;
use App\Models\User;
use App\Models\Attachment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentVerificationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $profile;
    protected $signature;
    protected $issuedDocument;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test user (registrar)
        $this->user = User::factory()->create([
            'user_role_id' => 1, // Registrar
            'username' => 'test_registrar',
            'email' => 'registrar@test.com'
        ]);
        
        // Create test profile (student)
        $studentUser = User::factory()->create([
            'user_role_id' => 2, // Student
            'username' => 'test_student',
            'email' => 'student@test.com'
        ]);
        
        $this->profile = Profile::factory()->create([
            'user_id' => $studentUser->id,
            'firstname' => 'John',
            'lastname' => 'Doe',
            'middlename' => 'Smith',
            'id_number' => '2212312323'
        ]);
        
        // Create test signature
        $this->signature = Signature::factory()->create([
            'key_id' => 'registrar-2025-07',
            'algorithm' => 'ES256'
        ]);
        
        // Create test issued document
        $this->issuedDocument = IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'registrar_id' => $this->user->id,
            'signature_id' => $this->signature->id,
            'document_type' => 'Transcript of Records',
            'document_id_number' => 'TOR-000042',
            'current_version' => 1.0,
            'date_issued' => '2025-07-11 14:32:55'
        ]);
        
        // Set up storage for testing
        Storage::fake('public');
        
        // Authenticate as registrar
        $this->actingAs($this->user);
    }

    /** @test */
    public function it_can_verify_document_and_return_proper_json_structure()
    {
        // Create a test PDF file and attachment
        $pdfContent = '%PDF-1.4 Test document content for hashing';
        $tempFile = tempnam(sys_get_temp_dir(), 'test_pdf_');
        file_put_contents($tempFile, $pdfContent);
        
        // Create attachment record
        $attachment = new Attachment([
            'file_name' => 'Transcript of Records -v1.0.pdf',
            'file_path' => 'storage/documents/profile/test/transcript.pdf',
            'file_size' => '1.5 MB',
            'file_ext' => 'pdf',
            'file_type' => 'document',
            'file_description' => 'Issued Document'
        ]);
        
        $this->issuedDocument->attachments()->save($attachment);
        
        // Store the test file in the fake storage
        Storage::disk('public')->put('documents/profile/test/transcript.pdf', $pdfContent);
        
        // Test the verification endpoint
        $response = $this->getJson("/api/document-verification/{$this->issuedDocument->document_id_number}");
        
        $response->assertStatus(200);
        
        $data = $response->json();
        
        // Verify the structure matches the required format
        $this->assertArrayHasKey('current_version', $data);
        $this->assertArrayHasKey('algorithm', $data);
        $this->assertArrayHasKey('kid', $data);
        $this->assertArrayHasKey('doc_id', $data);
        $this->assertArrayHasKey('type', $data);
        $this->assertArrayHasKey('registrar_id', $data);
        $this->assertArrayHasKey('issued_at', $data);
        $this->assertArrayHasKey('pdf_hash', $data);
        
        // Verify specific values
        $this->assertEquals(1.0, $data['current_version']);
        $this->assertEquals('ES256', $data['algorithm']);
        $this->assertEquals('registrar-2025-07', $data['kid']);
        $this->assertEquals('TOR-000042', $data['doc_id']);
        $this->assertEquals('TOR', $data['type']);
        $this->assertEquals('2212312323', $data['registrar_id']);
        $this->assertEquals('2025-07-11T14:32:55.000000Z', $data['issued_at']);
        
        // Verify PDF hash is calculated correctly
        $expectedHash = hash('sha256', $pdfContent);
        $this->assertEquals($expectedHash, $data['pdf_hash']);
        
        // Clean up
        unlink($tempFile);
    }

    /** @test */
    public function it_returns_404_when_document_not_found()
    {
        $response = $this->getJson('/api/document-verification/non-existent-doc');
        
        $response->assertStatus(404)
                ->assertJson([
                    'success' => false,
                    'message' => 'Document not found'
                ]);
    }

    /** @test */
    public function it_can_list_verifiable_documents()
    {
        // Create additional test documents
        IssuedDocument::factory()->count(3)->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id
        ]);
        
        $response = $this->getJson('/api/document-verification/list');
        
        $response->assertStatus(200)
                ->assertJson(['success' => true])
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'data' => [
                            '*' => [
                                'id',
                                'document_id_number',
                                'document_type',
                                'profile',
                                'signature'
                            ]
                        ]
                    ],
                    'message'
                ]);
    }

    /** @test */
    public function it_can_get_verification_status_for_multiple_documents()
    {
        $doc1 = IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id,
            'document_id_number' => 'DOC-001'
        ]);
        
        $doc2 = IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id,
            'document_id_number' => 'DOC-002'
        ]);
        
        $response = $this->getJson('/api/document-verification/status/check?document_ids[]=DOC-001&document_ids[]=DOC-002');
        
        $response->assertStatus(200)
                ->assertJson(['success' => true])
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        '*' => [
                            'doc_id',
                            'is_valid',
                            'status',
                            'issued_at',
                            'type'
                        ]
                    ],
                    'message'
                ]);
    }

    /** @test */
    public function it_can_search_documents_by_various_criteria()
    {
        // Test search by document ID
        $response = $this->getJson("/api/document-verification/list?search={$this->issuedDocument->document_id_number}");
        $response->assertStatus(200);
        
        // Test search by student name
        $response = $this->getJson('/api/document-verification/list?search=John');
        $response->assertStatus(200);
        
        // Test filter by document type
        $response = $this->getJson('/api/document-verification/list?document_type=Transcript of Records');
        $response->assertStatus(200);
    }

    /** @test */
    public function it_handles_different_document_types_correctly()
    {
        $documentTypes = [
            'Transcript of Records' => 'TOR',
            'Certificate of Enrollment' => 'COE',
            'Diploma' => 'DIP',
            'Certificate of Graduation' => 'COG',
            'Certificate of Good Moral Character' => 'GMC'
        ];
        
        foreach ($documentTypes as $fullType => $shortType) {
            $doc = IssuedDocument::factory()->create([
                'profile_id' => $this->profile->id,
                'signature_id' => $this->signature->id,
                'registrar_id' => $this->user->id,
                'document_type' => $fullType,
                'document_id_number' => "TEST-{$shortType}-001"
            ]);
            
            $response = $this->getJson("/api/document-verification/{$doc->document_id_number}");
            $response->assertStatus(200);
            
            $data = $response->json();
            $this->assertEquals($shortType, $data['type']);
        }
    }

    /** @test */
    public function it_can_get_detailed_document_information()
    {
        $response = $this->getJson("/api/document-verification/details/{$this->issuedDocument->document_id_number}");
        
        $response->assertStatus(200)
                ->assertJson(['success' => true])
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'document',
                        'verification' => [
                            'current_version',
                            'algorithm',
                            'kid',
                            'doc_id',
                            'type',
                            'registrar_id',
                            'issued_at',
                            'pdf_hash'
                        ]
                    ]
                ]);
    }

    /** @test */
    public function it_handles_missing_pdf_file_gracefully()
    {
        // Create document without PDF attachment
        $doc = IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id,
            'document_id_number' => 'NO-PDF-001'
        ]);
        
        $response = $this->getJson("/api/document-verification/{$doc->document_id_number}");
        
        $response->assertStatus(200);
        $data = $response->json();
        
        // PDF hash should be null when no file exists
        $this->assertNull($data['pdf_hash']);
    }

    /** @test */
    public function it_validates_request_parameters()
    {
        // Test verification status without document IDs
        $response = $this->getJson('/api/document-verification/status/check');
        
        $response->assertStatus(400)
                ->assertJson([
                    'success' => false,
                    'message' => 'No document IDs provided'
                ]);
    }

    /** @test */
    public function it_correctly_calculates_pdf_hash_for_different_files()
    {
        $testCases = [
            'Small PDF' => 'Small test content',
            'Medium PDF' => str_repeat('Medium test content with more data ', 100),
            'Large PDF' => str_repeat('Large test content with lots of data ', 1000)
        ];
        
        foreach ($testCases as $description => $content) {
            $doc = IssuedDocument::factory()->create([
                'profile_id' => $this->profile->id,
                'signature_id' => $this->signature->id,
                'registrar_id' => $this->user->id,
                'document_id_number' => 'HASH-TEST-' . uniqid()
            ]);
            
            // Create attachment with the test content
            $attachment = new Attachment([
                'file_name' => 'test.pdf',
                'file_path' => "storage/test/{$doc->id}/test.pdf",
                'file_size' => strlen($content) . ' bytes',
                'file_ext' => 'pdf',
                'file_type' => 'document',
                'file_description' => $description
            ]);
            
            $doc->attachments()->save($attachment);
            
            // Store the test content
            Storage::disk('public')->put("test/{$doc->id}/test.pdf", $content);
            
            $response = $this->getJson("/api/document-verification/{$doc->document_id_number}");
            $data = $response->json();
            
            $expectedHash = hash('sha256', $content);
            $this->assertEquals($expectedHash, $data['pdf_hash'], "Hash mismatch for: {$description}");
        }
    }
}
