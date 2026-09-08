<?php

use App\Http\Controllers\PrototypeInquiryController;
use Illuminate\Support\Facades\Route;

Route::post('/prototype-inquiries', [PrototypeInquiryController::class, 'store'])
    ->middleware('throttle:20,1')
    ->name('prototype-inquiries.store');
