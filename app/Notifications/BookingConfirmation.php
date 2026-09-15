<?php

namespace App\Notifications;

use App\Models\PrototypeInquiry;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent to the person who submitted a booking request, confirming PA LINE
 * received it. Intentionally NOT queued: production has no queue worker, so
 * these are dispatched synchronously (see PrototypeInquiryController) to
 * guarantee delivery.
 */
class BookingConfirmation extends Notification
{
    public function __construct(private readonly PrototypeInquiry $inquiry) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $lead = $this->inquiry->payload['lead'] ?? [];
        $record = $this->inquiry->payload['record'] ?? [];
        $summary = $record['body'] ?? ($lead['title'] ?? null);

        $mail = (new MailMessage)
            ->subject('We received your PA LINE booking request')
            ->greeting('Thanks, '.$this->inquiry->contact_name.'!')
            ->line('We’ve received your booking request and the PA LINE team will be in touch soon.');

        if ($summary !== null) {
            $mail->line('Your request: '.$summary);
        }

        return $mail
            ->line('If any details change, just reply to this email and let us know.')
            ->salutation('— PA LINE');
    }
}
