<?php

namespace App\Domain\Booking;

use DateTimeImmutable;
use DomainException;

final readonly class LegalAcknowledgmentService
{
    public function open(LegalDocumentVersion $document, DateTimeImmutable $openedAt): LegalReview
    {
        return new LegalReview($document->id, $document->sha256, $openedAt);
    }

    public function canAcknowledge(LegalDocumentVersion $activeDocument, LegalReview $review): bool
    {
        return $review->documentVersionId === $activeDocument->id
            && hash_equals($activeDocument->sha256, $review->documentHash)
            && $review->reachedEndAt !== null;
    }

    public function acknowledge(
        LegalDocumentVersion $activeDocument,
        LegalReview $review,
        string $userId,
        string $bookingId,
        string $signatureName,
        string $signatureRole,
        string $typedSignature,
        bool $acknowledged,
        bool $electronicSignatureConsent,
        DateTimeImmutable $acknowledgedAt,
        ?string $ipAddress = null,
        ?string $userAgent = null,
    ): LegalAcknowledgment {
        if (! $this->canAcknowledge($activeDocument, $review)) {
            throw new DomainException('The active document version must be reviewed to the end before acknowledgment.');
        }

        if (! $acknowledged || ! $electronicSignatureConsent) {
            throw new DomainException('Document acknowledgment and electronic signature consent are required.');
        }

        $name = trim($signatureName);
        $role = trim($signatureRole);

        if ($name === '' || $role === '') {
            throw new DomainException('Signer name and authority are required.');
        }

        if (trim($typedSignature) !== $name) {
            throw new DomainException('Typed signature must match the signer name.');
        }

        if ($acknowledgedAt < $review->reachedEndAt) {
            throw new DomainException('Document acknowledgment cannot predate completed review.');
        }

        return new LegalAcknowledgment(
            $activeDocument->id,
            $activeDocument->sha256,
            $userId,
            $bookingId,
            $review->openedAt,
            $review->reachedEndAt,
            $acknowledgedAt,
            $acknowledgedAt,
            $name,
            $role,
            $ipAddress,
            $userAgent,
        );
    }
}