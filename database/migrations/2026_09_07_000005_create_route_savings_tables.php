<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_savings_events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('booking_request_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('triggering_booking_request_id')->nullable()->constrained('booking_requests')->nullOnDelete();
            $table->unsignedInteger('protected_travel_ceiling');
            $table->unsignedInteger('recalculated_travel_charge');
            $table->unsignedInteger('savings');
            $table->string('source');
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        Schema::create('route_savings_elections', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('route_savings_event_id')->constrained()->cascadeOnDelete()->unique();
            $table->string('preset');
            $table->unsignedTinyInteger('return_percent');
            $table->unsignedTinyInteger('credit_percent');
            $table->unsignedTinyInteger('reinvest_percent');
            $table->unsignedInteger('return_amount');
            $table->unsignedInteger('credit_amount');
            $table->unsignedInteger('reinvest_amount');
            $table->timestamp('elected_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_savings_elections');
        Schema::dropIfExists('route_savings_events');
    }
};
