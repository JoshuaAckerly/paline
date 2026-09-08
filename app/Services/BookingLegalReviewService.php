<?php

namespace App\Services;

use App\Domain\Booking\LegalAcknowledgmentService;
use App\Domain\Booking\LegalDocumentVersion;
use App\Domain\Booking\LegalReview;
use App\Models\BookingDocumentReview;
use App\Models\BookingLegalAcknowledgment;
use App\Models\BookingRequest;
use App\Models\LegalDocument;
use App\Models\User;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Support\Str;

/**
 * Bridges the pure-domain LegalAcknowledgmentService/LegalReview/LegalDocumentVersion
 * value objects to real persistence for the public Review & Sign flow.
 */
class BookingLegalReviewService
{
    public function __construct(private readonly LegalAcknowledgmentService $service) {}

    public function activeDocument(string $documentKey): LegalDocument
    {
        $document = LegalDocument::query()
            ->where('document_key', $documentKey)
            ->where('is_active', true)
            ->first();

        if ($document === null) {
            throw new DomainException("No active legal document is configured for \"{$documentKey}\".");
        }

        return $document;
    }

    public function activeVersion(LegalDocument $document): LegalDocumentVersion
    {
        return new LegalDocumentVersion($document->id, $document->document_key, $document->version, $document->content_hash);
    }

    public function openReview(BookingRequest $booking, string $documentKey): BookingDocumentReview
    {
        $document = $this->activeDocument($documentKey);
        $version = $this->activeVersion($document);
        $existing = BookingDocumentReview::query()
            ->where('booking_request_id', $booking->id)
            ->where('document_key', $documentKey)
            ->first();

        // A new/changed active document version restarts the scroll-to-unlock review.
        if ($existing !== null && $existing->document_hash === $version->sha256) {
            return $existing;
        }

        return BookingDocumentReview::updateOrCreate(
            ['booking_request_id' => $booking->id, 'document_key' => $documentKey],
            [
                'document_version_id' => $document->id,
                'document_hash' => $version->sha256,
                'opened_at' => CarbonImmutable::now(),
                'reached_end_at' => null,
            ],
        );
    }

    public function markReachedEnd(BookingRequest $booking, string $documentKey): BookingDocumentReview
    {
        $review = BookingDocumentReview::query()
            ->where('booking_request_id', $booking->id)
            ->where('document_key', $documentKey)
            ->firstOrFail();

        $domainReview = new LegalReview($review->document_version_id, $review->document_hash, CarbonImmutable::parse($review->opened_at));
        $updated = $domainReview->markReachedEnd(CarbonImmutable::now());

        $review->update(['reached_end_at' => $updated->reachedEndAt]);

        return $review->refresh();
    }

    public function canAcknowledge(BookingRequest $booking, string $documentKey): bool
    {
        $document = $this->activeDocument($documentKey);
        $version = $this->activeVersion($document);
        $review = BookingDocumentReview::query()
            ->where('booking_request_id', $booking->id)
            ->where('document_key', $documentKey)
            ->first();

        if ($review === null) {
            return false;
        }

        $domainReview = new LegalReview(
            $review->document_version_id,
            $review->document_hash,
            CarbonImmutable::parse($review->opened_at),
            $review->reached_end_at !== null ? CarbonImmutable::parse($review->reached_end_at) : null,
        );

        return $this->service->canAcknowledge($version, $domainReview);
    }

    public function hasAcknowledged(BookingRequest $booking, string $documentKey): bool
    {
        $version = $this->activeVersion($this->activeDocument($documentKey));

        return BookingLegalAcknowledgment::query()
            ->where('booking_request_id', $booking->id)
            ->where('document_key', $documentKey)
            ->where('document_hash', $version->sha256)
            ->exists();
    }

    public function acknowledge(
        BookingRequest $booking,
        string $documentKey,
        User $user,
        string $signatureName,
        string $signatureRole,
        string $typedSignature,
        bool $electronicSignatureConsent,
        ?string $ipAddress,
        ?string $userAgent,
    ): BookingLegalAcknowledgment {
        $document = $this->activeDocument($documentKey);
        $version = $this->activeVersion($document);
        $review = BookingDocumentReview::query()
            ->where('booking_request_id', $booking->id)
            ->where('document_key', $documentKey)
            ->firstOrFail();

        $domainReview = new LegalReview(
            $review->document_version_id,
            $review->document_hash,
            CarbonImmutable::parse($review->opened_at),
            $review->reached_end_at !== null ? CarbonImmutable::parse($review->reached_end_at) : null,
        );

        $acknowledgment = $this->service->acknowledge(
            $version,
            $domainReview,
            (string) $user->id,
            $booking->id,
            $signatureName,
            $signatureRole,
            $typedSignature,
            true,
            $electronicSignatureConsent,
            CarbonImmutable::now(),
            $ipAddress,
            $userAgent,
        );

        return BookingLegalAcknowledgment::create([
            'id' => (string) Str::ulid(),
            'booking_request_id' => $booking->id,
            'document_key' => $documentKey,
            'document_version_id' => $acknowledgment->documentVersionId,
            'document_hash' => $acknowledgment->documentHash,
            'user_id' => $user->id,
            'opened_at' => $acknowledgment->openedAt,
            'reached_end_at' => $acknowledgment->reachedEndAt,
            'acknowledged_at' => $acknowledgment->acknowledgedAt,
            'signature_timestamp' => $acknowledgment->signatureTimestamp,
            'signature_name' => $acknowledgment->signatureName,
            'signature_role' => $acknowledgment->signatureRole,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }
}
