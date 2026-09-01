<?php

namespace Tests\Unit\Domain\Booking;

use App\Domain\Booking\LegalAcknowledgmentService;
use App\Domain\Booking\LegalDocumentVersion;
use DateTimeImmutable;
use DomainException;
use PHPUnit\Framework\TestCase;

class LegalAcknowledgmentServiceTest extends TestCase
{
    private LegalAcknowledgmentService $service;
    private LegalDocumentVersion $document;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new LegalAcknowledgmentService;
        $this->document = new LegalDocumentVersion('doc-v1', 'performance_agreement', '1.0', str_repeat('a', 64));
    }

    public function test_opening_a_document_does_not_unlock_acknowledgment(): void
    {
        $review = $this->service->open($this->document, new DateTimeImmutable('2026-09-01 12:00:00'));

        $this->assertFalse($this->service->canAcknowledge($this->document, $review));
        $this->assertNull($review->reachedEndAt);
    }

    public function test_reaching_the_end_of_the_active_version_unlocks_acknowledgment(): void
    {
        $review = $this->completedReview();

        $this->assertTrue($this->service->canAcknowledge($this->document, $review));
    }

    public function test_a_new_document_version_invalidates_old_review_progress(): void
    {
        $changedDocument = new LegalDocumentVersion(
            'doc-v2',
            'performance_agreement',
            '2.0',
            str_repeat('b', 64),
        );

        $this->assertFalse($this->service->canAcknowledge($changedDocument, $this->completedReview()));
    }

    public function test_it_creates_an_immutable_version_bound_audit_record(): void
    {
        $acknowledgedAt = new DateTimeImmutable('2026-09-01 12:10:00');
        $record = $this->service->acknowledge(
            $this->document,
            $this->completedReview(),
            'user-1',
            'booking-1',
            'Jamie Buyer',
            'Talent Buyer',
            'Jamie Buyer',
            true,
            true,
            $acknowledgedAt,
            '192.0.2.1',
            'Test Browser',
        );

        $this->assertSame('doc-v1', $record->documentVersionId);
        $this->assertSame(str_repeat('a', 64), $record->documentHash);
        $this->assertSame('user-1', $record->userId);
        $this->assertSame('booking-1', $record->bookingId);
        $this->assertSame('Jamie Buyer', $record->signatureName);
        $this->assertSame('Talent Buyer', $record->signatureRole);
        $this->assertSame($acknowledgedAt, $record->signatureTimestamp);
    }

    public function test_it_rejects_acknowledgment_before_reaching_the_end(): void
    {
        $this->expectException(DomainException::class);

        $this->acknowledge($this->service->open($this->document, new DateTimeImmutable('2026-09-01 12:00:00')));
    }

    public function test_it_rejects_a_typed_signature_that_does_not_match(): void
    {
        $this->expectException(DomainException::class);

        $this->service->acknowledge(
            $this->document,
            $this->completedReview(),
            'user-1',
            'booking-1',
            'Jamie Buyer',
            'Talent Buyer',
            'Someone Else',
            true,
            true,
            new DateTimeImmutable('2026-09-01 12:10:00'),
        );
    }

    public function test_it_rejects_missing_manual_acknowledgment_or_consent(): void
    {
        $this->expectException(DomainException::class);

        $this->service->acknowledge(
            $this->document,
            $this->completedReview(),
            'user-1',
            'booking-1',
            'Jamie Buyer',
            'Talent Buyer',
            'Jamie Buyer',
            false,
            true,
            new DateTimeImmutable('2026-09-01 12:10:00'),
        );
    }

    private function completedReview()
    {
        return $this->service
            ->open($this->document, new DateTimeImmutable('2026-09-01 12:00:00'))
            ->markReachedEnd(new DateTimeImmutable('2026-09-01 12:05:00'));
    }

    private function acknowledge($review): void
    {
        $this->service->acknowledge(
            $this->document,
            $review,
            'user-1',
            'booking-1',
            'Jamie Buyer',
            'Talent Buyer',
            'Jamie Buyer',
            true,
            true,
            new DateTimeImmutable('2026-09-01 12:10:00'),
        );
    }
}