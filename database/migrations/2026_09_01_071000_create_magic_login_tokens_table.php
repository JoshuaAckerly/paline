<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 40)->nullable()->after('email');
        });

        Schema::create('magic_login_tokens', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('email');
            $table->string('display_name')->nullable();
            $table->string('token_hash', 64)->unique();
            $table->foreignUlid('booking_request_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();
            $table->index(['email', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('magic_login_tokens');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('phone');
        });
    }
};