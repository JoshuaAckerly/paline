<?php

namespace App\Domain\Booking;

use DateTimeImmutable;

final readonly class LegalAcknowledgment
{
    public function __construct(
        public string $documentVersionId,
        public string $documentHash,
        public string $userId,
        public string $bookingId,
        public DateTimeImmutable $openedAt,
        public DateTimeImmutable $reachedEndAt,
        public DateTimeImmutable $acknowledgedAt,
        public DateTimeImmutable $signatureTimestamp,
        public string $signatureName,
        public string $signatureRole,
        public ?string $ipAddress,
        public ?string $userAgent,
    ) {}
}