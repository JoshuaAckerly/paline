<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('legal_documents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('document_key');
            $table->string('version');
            $table->string('title');
            $table->date('effective_date')->nullable();
            $table->longText('content');
            $table->string('content_hash', 64);
            $table->boolean('is_active')->default(false);
            $table->timestamps();
            $table->index(['document_key', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_documents');
    }
};
