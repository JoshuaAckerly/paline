<?php

namespace App\Http\Controllers;

use App\Models\BookingRequest;
use App\Services\BookingLegalReviewService;
use App\Services\BookingUserAccess;
use App\Services\PreliminaryQuoteEstimator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BookingQuoteController extends Controller
{
    public function show(
        Request $request,
        BookingRequest $bookingRequest,
        BookingUserAccess $access,
        BookingLegalReviewService $reviews,
        PreliminaryQuoteEstimator $estimator,
    ): JsonResponse {
        $access->authorize($bookingRequest, $request->user());

        if (! $reviews->hasAcknowledged($bookingRequest, 'nda')) {
            throw ValidationException::withMessages(['nda' => 'Accept the confidentiality agreement before viewing pricing.']);
        }

        return response()->json($estimator->itemize($bookingRequest));
    }
}
