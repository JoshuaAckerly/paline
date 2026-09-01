<?php

namespace App\Domain\Booking;

use DateTimeImmutable;
use InvalidArgumentException;

final readonly class LegalReview
{
    public function __construct(
        public string $documentVersionId,
        public string $documentHash,
        public DateTimeImmutable $openedAt,
        public ?DateTimeImmutable $reachedEndAt = null,
    ) {
        if ($reachedEndAt !== null && $reachedEndAt < $openedAt) {
            throw new InvalidArgumentException('Document review cannot finish before it begins.');
        }
    }

    public function markReachedEnd(DateTimeImmutable $reachedEndAt): self
    {
        return new self($this->documentVersionId, $this->documentHash, $this->openedAt, $reachedEndAt);
    }
}