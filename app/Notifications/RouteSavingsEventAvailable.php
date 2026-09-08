<?php

namespace App\Notifications;

use App\Models\RouteSavingsEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RouteSavingsEventAvailable extends Notification
{
    use Queueable;

    public function __construct(private readonly RouteSavingsEvent $event) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $savings = number_format($this->event->savings, 2);

        return (new MailMessage)
            ->subject('A route change saved $'.$savings.' on your PA LINE booking')
            ->line('A nearby PA LINE booking confirmed a route-friendly date, reducing the protected travel charge attached to your show.')
            ->line('You can now choose what happens to the $'.$savings.' savings.')
            ->action('REVIEW THE SAVINGS', url('/route-savings/'.$this->event->id))
            ->line('PA LINE still confirms the final routing before anything changes.');
    }
}
