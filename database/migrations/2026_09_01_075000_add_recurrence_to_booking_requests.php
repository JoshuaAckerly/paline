<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_requests', function (Blueprint $table) {
            $table->string('booking_type')->nullable()->after('performance_length_minutes');
            $table->string('recurrence_frequency')->nullable()->after('booking_type');
        });
    }

    public function down(): void
    {
        Schema::table('booking_requests', function (Blueprint $table) {
            $table->dropColumn(['booking_type', 'recurrence_frequency']);
        });
    }
};