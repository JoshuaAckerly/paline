<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MagicLoginLink extends Notification
{
    use Queueable;

    public function __construct(private readonly string $url) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your PA LINE secure sign-in link')
            ->line('Use this one-time link to continue your PA LINE booking.')
            ->action('CONTINUE BOOKING', $this->url)
            ->line('This link expires in '.config('booking.authentication.magic_link_expiration_minutes').' minutes.');
    }
}