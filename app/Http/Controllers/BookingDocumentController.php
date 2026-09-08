<?php

namespace App\Http\Controllers;

use App\Domain\Booking\BookingStatus;
use App\Models\BookingRequest;
use App\Services\BookingLegalReviewService;
use App\Services\BookingUserAccess;
use App\Support\HtmlSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingDocumentController extends Controller
{
    /** @var list<string> */
    private const DOCUMENT_KEYS = ['agreement', 'nda', 'stage', 'tech', 'hospitality'];

    public function show(
        Request $request,
        BookingRequest $bookingRequest,
        string $documentKey,
        BookingUserAccess $access,
        BookingLegalReviewService $reviews,
    ): JsonResponse {
        $access->authorize($bookingRequest, $request->user());
        $this->validateDocumentKey($documentKey);

        $document = $reviews->activeDocument($documentKey);
        $review = $reviews->openReview($bookingRequest, $documentKey);

        return response()->json([
            'document_key' => $documentKey,
            'title' => $document->title,
            'version' => $document->version,
            'content' => HtmlSanitizer::sanitize($document->content),
            'reached_end' => $review->reached_end_at !== null,
        ]);
    }

    public function markReviewed(
        Request $request,
        BookingRequest $bookingRequest,
        string $documentKey,
        BookingUserAccess $access,
        BookingLegalReviewService $reviews,
    ): JsonResponse {
        $access->authorize($bookingRequest, $request->user());
        $this->validateDocumentKey($documentKey);

        $reviews->markReachedEnd($bookingRequest, $documentKey);

        return response()->json(['status' => 'reviewed', 'can_acknowledge' => $reviews->canAcknowledge($bookingRequest, $documentKey)]);
    }

    public function acceptConfidentiality(
        Request $request,
        BookingRequest $bookingRequest,
        BookingUserAccess $access,
        BookingLegalReviewService $reviews,
    ): JsonResponse {
        $access->authorize($bookingRequest, $request->user());

        $validated = $request->validate([
            'signer_name' => ['required', 'string', 'max:255'],
            'signer_title' => ['required', 'string', 'max:255'],
            'confidentiality_ack' => ['required', 'accepted'],
            'electronic_signature_consent' => ['required', 'accepted'],
        ]);

        if (! $reviews->canAcknowledge($bookingRequest, 'nda')) {
            throw ValidationException::withMessages(['nda' => 'Open the confidentiality terms and scroll to the bottom first.']);
        }

        $reviews->acknowledge(
            $bookingRequest,
            'nda',
            $request->user(),
            $validated['signer_name'],
            $validated['signer_title'],
            $validated['signer_name'],
            true,
            $request->ip(),
            $request->userAgent(),
        );

        $bookingRequest->update(['status' => BookingStatus::QuoteGenerated]);

        return response()->json(['status' => 'confidentiality_accepted']);
    }

    public function sign(
        Request $request,
        BookingRequest $bookingRequest,
        BookingUserAccess $access,
        BookingLegalReviewService $reviews,
    ): JsonResponse {
        $access->authorize($bookingRequest, $request->user());

        $validated = $request->validate([
            'signer_name' => ['required', 'string', 'max:255'],
            'signer_title' => ['required', 'string', 'max:255'],
            'signature' => ['required', 'string', 'max:255'],
            'signed_date' => ['required', 'date_format:Y-m-d'],
            'electronic_signature_consent' => ['required', 'accepted'],
            'final_acknowledgment' => ['required', 'accepted'],
        ]);

        if (strtolower(trim($validated['signature'])) !== strtolower(trim($validated['signer_name']))) {
            throw ValidationException::withMessages(['signature' => 'The typed signature must match the signer name.']);
        }

        $requiredKeys = ['agreement', 'stage', 'tech', 'hospitality'];
        $notReady = array_values(array_filter($requiredKeys, fn (string $key) => ! $reviews->canAcknowledge($bookingRequest, $key)));

        if ($notReady !== []) {
            throw ValidationException::withMessages([
                'documents' => 'Open and scroll through every required document before signing: '.implode(', ', $notReady).'.',
            ]);
        }

        DB::transaction(function () use ($bookingRequest, $validated, $requiredKeys, $reviews, $request): void {
            foreach ($requiredKeys as $key) {
                $reviews->acknowledge(
                    $bookingRequest,
                    $key,
                    $request->user(),
                    $validated['signer_name'],
                    $validated['signer_title'],
                    $validated['signature'],
                    true,
                    $request->ip(),
                    $request->userAgent(),
                );
            }

            $bookingRequest->update([
                'status' => BookingStatus::Submitted,
                'submitted_at' => now(),
            ]);
        });

        return response()->json([
            'status' => 'submitted',
            'submitted_at' => $bookingRequest->fresh()->submitted_at->toIso8601String(),
        ]);
    }

    private function validateDocumentKey(string $documentKey): void
    {
        Validator::make(['document_key' => $documentKey], [
            'document_key' => [Rule::in(self::DOCUMENT_KEYS)],
        ])->validate();
    }
}
