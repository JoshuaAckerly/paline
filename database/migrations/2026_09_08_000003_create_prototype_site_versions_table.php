<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prototype_site_versions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('original_filename');
            $table->string('storage_path');
            $table->string('content_hash', 64);
            $table->string('uploaded_by_email');
            $table->text('notes')->nullable();
            $table->string('status')->default('staged'); // staged|published|archived
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prototype_site_versions');
    }
};
