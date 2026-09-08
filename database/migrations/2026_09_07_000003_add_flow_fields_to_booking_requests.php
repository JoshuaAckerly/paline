<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_requests', function (Blueprint $table) {
            $table->timestamp('secured_at')->nullable()->after('submitted_at');
            $table->unsignedTinyInteger('prior_qualified_shows')->nullable()->after('secured_at');

            $table->boolean('exclusivity_requested')->nullable()->after('prior_qualified_shows');
            $table->unsignedSmallInteger('exclusivity_radius_miles')->nullable()->after('exclusivity_requested');
            $table->unsignedSmallInteger('exclusivity_days_before')->nullable()->after('exclusivity_radius_miles');
            $table->unsignedSmallInteger('exclusivity_days_after')->nullable()->after('exclusivity_days_before');
            $table->string('exclusivity_applies_to')->nullable()->after('exclusivity_days_after');
            $table->string('exclusivity_exceptions')->nullable()->after('exclusivity_applies_to');
            $table->unsignedInteger('exclusivity_fee')->nullable()->after('exclusivity_exceptions');

            $table->string('tech_rider_status')->nullable()->after('exclusivity_fee');
            $table->text('tech_rider_issue')->nullable()->after('tech_rider_status');
            $table->timestamp('tech_rider_acknowledged_at')->nullable()->after('tech_rider_issue');

            $table->timestamp('confirmed_at')->nullable()->after('tech_rider_acknowledged_at');
            $table->unsignedInteger('confirmed_travel_charge')->nullable()->after('confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('booking_requests', function (Blueprint $table) {
            $table->dropColumn([
                'secured_at', 'prior_qualified_shows',
                'exclusivity_requested', 'exclusivity_radius_miles', 'exclusivity_days_before',
                'exclusivity_days_after', 'exclusivity_applies_to', 'exclusivity_exceptions', 'exclusivity_fee',
                'tech_rider_status', 'tech_rider_issue', 'tech_rider_acknowledged_at',
                'confirmed_at', 'confirmed_travel_charge',
            ]);
        });
    }
};
