<?php

namespace App\Domain\Booking;

use InvalidArgumentException;

final readonly class LegalDocumentVersion
{
    public function __construct(
        public string $id,
        public string $documentKey,
        public string $version,
        public string $sha256,
    ) {
        if (trim($id) === '' || trim($documentKey) === '' || trim($version) === '') {
            throw new InvalidArgumentException('Legal document identity and version are required.');
        }

        if (! preg_match('/^[a-f0-9]{64}$/i', $sha256)) {
            throw new InvalidArgumentException('Legal document hash must be a SHA-256 value.');
        }
    }
}