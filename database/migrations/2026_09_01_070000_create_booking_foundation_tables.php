<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('type');
            $table->timestamps();
        });

        Schema::create('organization_user', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role');
            $table->timestamps();
            $table->unique(['organization_id', 'user_id']);
        });

        Schema::create('venues', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('street_address')->nullable();
            $table->string('city');
            $table->string('state', 64);
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 2)->default('US');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('production_notes')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('contacts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('venue_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('title')->nullable();
            $table->timestamps();
            $table->index('email');
        });

        Schema::create('booking_requests', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('requester_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUlid('venue_id')->nullable()->constrained()->nullOnDelete();
            $table->string('anonymous_token_hash', 64)->nullable()->unique();
            $table->string('source_path');
            $table->string('status')->default('draft');
            $table->string('event_name')->nullable();
            $table->date('primary_date')->nullable();
            $table->time('event_start')->nullable();
            $table->time('event_end')->nullable();
            $table->string('event_type')->nullable();
            $table->string('setting')->nullable();
            $table->unsignedInteger('estimated_attendance')->nullable();
            $table->string('performance_format')->nullable();
            $table->unsignedSmallInteger('performance_length_minutes')->nullable();
            $table->boolean('sound_provided')->nullable();
            $table->boolean('house_engineer_provided')->nullable();
            $table->boolean('true_potential_requested')->default(false);
            $table->timestamps();
        });

        Schema::create('booking_dates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('booking_request_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('availability_status');
            $table->timestamps();
            $table->unique(['booking_request_id', 'date']);
        });

        Schema::create('engagements', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('booking_request_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('booking_date_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('venue_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title')->nullable();
            $table->date('performance_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('status')->default('confirmed');
            $table->text('private_notes')->nullable();
            $table->timestamps();
            $table->index(['performance_date', 'status']);
        });

        Schema::create('booking_holds', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('booking_request_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('venue_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('status')->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
            $table->index(['date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_holds');
        Schema::dropIfExists('engagements');
        Schema::dropIfExists('booking_dates');
        Schema::dropIfExists('booking_requests');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('venues');
        Schema::dropIfExists('organization_user');
        Schema::dropIfExists('organizations');
    }
};