<?php

namespace App\Domain\Booking;

enum BookingStatus: string
{
    case Draft = 'draft';
    case AccountVerificationRequired = 'account_verification_required';
    case ConfidentialityRequired = 'confidentiality_required';
    case QuoteGenerated = 'quote_generated';
    case AwaitingTechnicalReview = 'awaiting_technical_review';
    case AwaitingDocuments = 'awaiting_documents';
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case NeedsChanges = 'needs_changes';
    case HoldPlaced = 'hold_placed';
    case ApprovedPendingContractOrPayment = 'approved_pending_contract_or_payment';
    case Confirmed = 'confirmed';
    case Declined = 'declined';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
}