<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_document_reviews', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('booking_request_id')->constrained()->cascadeOnDelete();
            $table->string('document_key');
            $table->foreignUlid('document_version_id')->constrained('legal_documents')->cascadeOnDelete();
            $table->string('document_hash', 64);
            $table->timestamp('opened_at');
            $table->timestamp('reached_end_at')->nullable();
            $table->timestamps();
            $table->unique(['booking_request_id', 'document_key']);
        });

        Schema::create('booking_legal_acknowledgments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('booking_request_id')->constrained()->cascadeOnDelete();
            $table->string('document_key');
            $table->foreignUlid('document_version_id')->constrained('legal_documents')->cascadeOnDelete();
            $table->string('document_hash', 64);
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('opened_at');
            $table->timestamp('reached_end_at');
            $table->timestamp('acknowledged_at');
            $table->timestamp('signature_timestamp');
            $table->string('signature_name');
            $table->string('signature_role');
            $table->string('ip_address', 64)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            $table->index(['booking_request_id', 'document_key'], 'booking_legal_acks_booking_document_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_legal_acknowledgments');
        Schema::dropIfExists('booking_document_reviews');
    }
};
