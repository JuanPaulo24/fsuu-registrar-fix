<?php

namespace Tests\Feature;

use App\Models\IssuedDocument;
use App\Models\Profile;
use App\Models\Signature;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class IssuedDocumentTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $profile;
    protected $signature;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test user (registrar)
        $this->user = User::factory()->create([
            'user_role_id' => 1, // Assuming 1 is admin/registrar
            'username' => 'test_registrar',
            'email' => 'registrar@test.com'
        ]);
        
        // Create test profile (student)
        $studentUser = User::factory()->create([
            'user_role_id' => 2, // Student role
            'username' => 'test_student',
            'email' => 'student@test.com'
        ]);
        
        $this->profile = Profile::factory()->create([
            'user_id' => $studentUser->id,
            'firstname' => 'John',
            'lastname' => 'Doe',
            'middlename' => 'Smith',
            'id_number' => '22100000001'
        ]);
        
        // Create test signature
        $this->signature = Signature::factory()->create([
            'key_id' => 'test-registrar-key',
            'algorithm' => 'RSA'
        ]);
        
        // Set up storage for testing
        Storage::fake('public');
        
        // Authenticate as registrar
        $this->actingAs($this->user);
    }

    /** @test */
    public function it_can_create_issued_document_without_file()
    {
        $data = [
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'document_type' => 'Transcript of Records',
            'current_version' => '1.0',
            'date_issued' => now()->format('Y-m-d H:i:s'),
            'date_revoked' => now()->addYear()->format('Y-m-d H:i:s'),
            'serial_number' => 'TR-2024-001',
            'document_id_number' => 'DOC-001-2024'
        ];

        $response = $this->postJson('/api/issued-documents', $data);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Data saved successfully'
                ]);

        $this->assertDatabaseHas('issued_documents', [
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'document_type' => 'Transcript of Records',
            'registrar_id' => $this->user->id,
            'serial_number' => 'TR-2024-001'
        ]);
    }

    /** @test */
    public function it_can_create_issued_document_with_file()
    {
        $file = UploadedFile::fake()->create('transcript.pdf', 1000, 'application/pdf');
        
        $data = [
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'document_type' => 'Transcript of Records',
            'current_version' => '1.0',
            'date_issued' => now()->format('Y-m-d H:i:s'),
            'date_revoked' => now()->addYear()->format('Y-m-d H:i:s'),
            'serial_number' => 'TR-2024-001',
            'document_id_number' => 'DOC-001-2024',
            'document_file' => $file
        ];

        $response = $this->postJson('/api/issued-documents', $data);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Data saved successfully'
                ]);

        // Check database
        $issuedDocument = IssuedDocument::latest()->first();
        $this->assertNotNull($issuedDocument);
        $this->assertEquals($this->profile->id, $issuedDocument->profile_id);
        $this->assertEquals($this->user->id, $issuedDocument->registrar_id);

        // Check attachment was created
        $this->assertCount(1, $issuedDocument->attachments);
        
        $attachment = $issuedDocument->attachments->first();
        $this->assertEquals('Transcript of Records -v1.0.pdf', $attachment->file_name);
        $this->assertEquals('Issued Document', $attachment->file_description);
        $this->assertEquals('pdf', $attachment->file_ext);
        
        // Check file was stored in correct location
        $expectedFolder = 'documents/profile/22100000001-Doe, John Smith';
        $this->assertStringContains($expectedFolder, $attachment->file_path);
    }

    /** @test */
    public function it_can_update_issued_document()
    {
        $issuedDocument = IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id,
            'document_type' => 'Certificate of Enrollment',
            'current_version' => '1.0'
        ]);

        $updateData = [
            'id' => $issuedDocument->id,
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'document_type' => 'Certificate of Enrollment',
            'current_version' => '2.0',
            'date_issued' => now()->format('Y-m-d H:i:s'),
            'date_revoked' => now()->addYear()->format('Y-m-d H:i:s'),
            'serial_number' => 'CE-2024-001',
            'document_id_number' => 'DOC-002-2024'
        ];

        $response = $this->postJson('/api/issued-documents', $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Data updated successfully'
                ]);

        $this->assertDatabaseHas('issued_documents', [
            'id' => $issuedDocument->id,
            'current_version' => '2.0',
            'serial_number' => 'CE-2024-001'
        ]);
    }

    /** @test */
    public function it_can_fetch_issued_documents_list()
    {
        IssuedDocument::factory()->count(3)->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id
        ]);

        $response = $this->getJson('/api/issued-documents');

        $response->assertStatus(200)
                ->assertJson(['success' => true])
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        '*' => [
                            'id',
                            'profile_id',
                            'signature_id',
                            'document_type',
                            'current_version',
                            'serial_number',
                            'profile',
                            'signature'
                        ]
                    ]
                ]);
    }

    /** @test */
    public function it_can_show_specific_issued_document()
    {
        $issuedDocument = IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id
        ]);

        $response = $this->getJson("/api/issued-documents/{$issuedDocument->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'id' => $issuedDocument->id,
                        'profile_id' => $this->profile->id,
                        'signature_id' => $this->signature->id
                    ]
                ]);
    }

    /** @test */
    public function it_can_archive_issued_documents()
    {
        $issuedDocument1 = IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id
        ]);

        $issuedDocument2 = IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id
        ]);

        $response = $this->postJson('/api/issued-documents/archive', [
            'ids' => [$issuedDocument1->id, $issuedDocument2->id],
            'isTrash' => false
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Data archived successfully'
                ]);

        // Check documents are soft deleted
        $this->assertSoftDeleted('issued_documents', ['id' => $issuedDocument1->id]);
        $this->assertSoftDeleted('issued_documents', ['id' => $issuedDocument2->id]);
    }

    /** @test */
    public function it_can_restore_archived_documents()
    {
        $issuedDocument = IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id,
            'deleted_at' => now()
        ]);

        $response = $this->postJson('/api/issued-documents/archive', [
            'ids' => [$issuedDocument->id],
            'isTrash' => true
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Data restored successfully'
                ]);

        $this->assertDatabaseHas('issued_documents', [
            'id' => $issuedDocument->id,
            'deleted_at' => null
        ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->postJson('/api/issued-documents', []);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_filters_by_document_type()
    {
        IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id,
            'document_type' => 'Transcript of Records'
        ]);

        IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id,
            'document_type' => 'Certificate of Enrollment'
        ]);

        $response = $this->getJson('/api/issued-documents?document_type=Transcript of Records');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        foreach ($data as $item) {
            $this->assertEquals('Transcript of Records', $item['document_type']);
        }
    }

    /** @test */
    public function it_searches_documents()
    {
        IssuedDocument::factory()->create([
            'profile_id' => $this->profile->id,
            'signature_id' => $this->signature->id,
            'registrar_id' => $this->user->id,
            'serial_number' => 'SEARCH-TEST-001'
        ]);

        $response = $this->getJson('/api/issued-documents?search=SEARCH-TEST');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertGreaterThan(0, count($data));
    }
}
