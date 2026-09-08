<?php

namespace App\Notifications;

use App\Models\PrototypeInquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPrototypeInquiry extends Notification
{
    use Queueable;

    public function __construct(private readonly PrototypeInquiry $inquiry) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $lead = $this->inquiry->payload['lead'] ?? [];

        return (new MailMessage)
            ->subject('New '.$this->inquiry->type.' request: '.($lead['title'] ?? $this->inquiry->contact_name))
            ->line(($lead['title'] ?? 'A new request').' was submitted through the PA LINE booking site.')
            ->line('Contact: '.$this->inquiry->contact_name.' ('.$this->inquiry->contact_email.')')
            ->when(!empty($this->inquiry->contact_phone), fn (MailMessage $mail) => $mail->line('Phone: '.$this->inquiry->contact_phone))
            ->when(!empty($lead['notes']), fn (MailMessage $mail) => $mail->line('Notes: '.$lead['notes']))
            ->action('VIEW IN ADMIN', url('/admin/prototype-inquiries/'.$this->inquiry->id));
    }
}
