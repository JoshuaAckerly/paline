<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_requests', function (Blueprint $table) {
            $table->string('true_potential_budget_range')->nullable()->after('true_potential_requested');
            $table->string('true_potential_notes')->nullable()->after('true_potential_budget_range');
            $table->string('contact_preference')->nullable()->after('confirmed_travel_charge');
            $table->text('contact_notes')->nullable()->after('contact_preference');
        });
    }

    public function down(): void
    {
        Schema::table('booking_requests', function (Blueprint $table) {
            $table->dropColumn(['true_potential_budget_range', 'true_potential_notes', 'contact_preference', 'contact_notes']);
        });
    }
};
