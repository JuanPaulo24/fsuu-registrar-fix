<?php

namespace Tests\Unit;

use App\Models\IssuedDocument;
use App\Models\Profile;
use App\Models\Signature;
use App\Models\DocumentGrade;
use App\Models\Attachment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssuedDocumentModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_profile()
    {
        $profile = Profile::factory()->create();
        $signature = Signature::factory()->create();
        
        $issuedDocument = IssuedDocument::factory()->create([
            'profile_id' => $profile->id,
            'signature_id' => $signature->id
        ]);

        $this->assertInstanceOf(Profile::class, $issuedDocument->profile);
        $this->assertEquals($profile->id, $issuedDocument->profile->id);
    }

    /** @test */
    public function it_belongs_to_signature()
    {
        $profile = Profile::factory()->create();
        $signature = Signature::factory()->create();
        
        $issuedDocument = IssuedDocument::factory()->create([
            'profile_id' => $profile->id,
            'signature_id' => $signature->id
        ]);

        $this->assertInstanceOf(Signature::class, $issuedDocument->signature);
        $this->assertEquals($signature->id, $issuedDocument->signature->id);
    }

    /** @test */
    public function it_has_many_document_grades()
    {
        $profile = Profile::factory()->create();
        $signature = Signature::factory()->create();
        
        $issuedDocument = IssuedDocument::factory()->create([
            'profile_id' => $profile->id,
            'signature_id' => $signature->id
        ]);

        DocumentGrade::factory()->count(3)->create([
            'issued_document_id' => $issuedDocument->id
        ]);

        $this->assertCount(3, $issuedDocument->documentGrade);
        $this->assertInstanceOf(DocumentGrade::class, $issuedDocument->documentGrade->first());
    }

    /** @test */
    public function it_has_attachments()
    {
        $profile = Profile::factory()->create();
        $signature = Signature::factory()->create();
        
        $issuedDocument = IssuedDocument::factory()->create([
            'profile_id' => $profile->id,
            'signature_id' => $signature->id
        ]);

        // Create attachments using the polymorphic relationship
        $attachment1 = new Attachment([
            'file_name' => 'test1.pdf',
            'file_path' => 'storage/documents/test1.pdf',
            'file_size' => '1.5 MB',
            'file_ext' => 'pdf',
            'file_type' => 'document',
            'file_description' => 'Test Document 1'
        ]);

        $attachment2 = new Attachment([
            'file_name' => 'test2.pdf',
            'file_path' => 'storage/documents/test2.pdf',
            'file_size' => '2.0 MB',
            'file_ext' => 'pdf',
            'file_type' => 'document',
            'file_description' => 'Test Document 2'
        ]);

        $issuedDocument->attachments()->save($attachment1);
        $issuedDocument->attachments()->save($attachment2);

        $this->assertCount(2, $issuedDocument->attachments);
        $this->assertInstanceOf(Attachment::class, $issuedDocument->attachments->first());
    }

    /** @test */
    public function it_uses_soft_deletes()
    {
        $profile = Profile::factory()->create();
        $signature = Signature::factory()->create();
        
        $issuedDocument = IssuedDocument::factory()->create([
            'profile_id' => $profile->id,
            'signature_id' => $signature->id
        ]);

        $issuedDocument->delete();

        // Check that the document is soft deleted
        $this->assertSoftDeleted('issued_documents', ['id' => $issuedDocument->id]);
        
        // Check that we can still access it with trashed()
        $trashedDocument = IssuedDocument::withTrashed()->find($issuedDocument->id);
        $this->assertNotNull($trashedDocument);
        $this->assertNotNull($trashedDocument->deleted_at);
    }

    /** @test */
    public function it_has_fillable_attributes()
    {
        $profile = Profile::factory()->create();
        $signature = Signature::factory()->create();
        
        $data = [
            'profile_id' => $profile->id,
            'registrar_id' => 1,
            'signature_id' => $signature->id,
            'document_type' => 'Transcript of Records',
            'document_version' => 'v1.0',
            'serial_number' => 'TR-2024-001',
            'document_id_number' => 'DOC-001-2024',
            'current_version' => 1.0,
            'date_issued' => now(),
            'date_revoked' => now()->addYear(),
            'created_by' => 1,
            'updated_by' => 1,
        ];

        $issuedDocument = IssuedDocument::create($data);

        $this->assertEquals($profile->id, $issuedDocument->profile_id);
        $this->assertEquals($signature->id, $issuedDocument->signature_id);
        $this->assertEquals('Transcript of Records', $issuedDocument->document_type);
        $this->assertEquals('v1.0', $issuedDocument->document_version);
        $this->assertEquals('TR-2024-001', $issuedDocument->serial_number);
        $this->assertEquals('DOC-001-2024', $issuedDocument->document_id_number);
        $this->assertEquals(1.0, $issuedDocument->current_version);
    }

    /** @test */
    public function it_can_be_restored_after_soft_delete()
    {
        $profile = Profile::factory()->create();
        $signature = Signature::factory()->create();
        
        $issuedDocument = IssuedDocument::factory()->create([
            'profile_id' => $profile->id,
            'signature_id' => $signature->id
        ]);

        // Soft delete
        $issuedDocument->delete();
        $this->assertSoftDeleted('issued_documents', ['id' => $issuedDocument->id]);

        // Restore
        $issuedDocument->restore();
        
        // Check that it's restored
        $this->assertDatabaseHas('issued_documents', [
            'id' => $issuedDocument->id,
            'deleted_at' => null
        ]);
    }
}
