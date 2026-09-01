<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_requests', function (Blueprint $table) {
            $table->string('preferred_city')->nullable()->after('primary_date');
            $table->string('preferred_state', 64)->nullable()->after('preferred_city');
            $table->date('window_starts_on')->nullable()->after('preferred_state');
            $table->date('window_ends_on')->nullable()->after('window_starts_on');
        });

        Schema::create('demand_signals', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('city');
            $table->string('state', 64);
            $table->string('postal_code', 20)->nullable();
            $table->string('preferred_venue')->nullable();
            $table->string('alternate_venue')->nullable();
            $table->unsignedSmallInteger('estimated_attendees')->default(1);
            $table->string('local_role');
            $table->text('notes')->nullable();
            $table->text('name');
            $table->text('email');
            $table->text('phone')->nullable();
            $table->string('update_preference')->nullable();
            $table->boolean('consent_to_updates')->default(false);
            $table->json('momentum_actions')->nullable();
            $table->timestamps();
            $table->index(['state', 'city']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demand_signals');

        Schema::table('booking_requests', function (Blueprint $table) {
            $table->dropColumn(['preferred_city', 'preferred_state', 'window_starts_on', 'window_ends_on']);
        });
    }
};