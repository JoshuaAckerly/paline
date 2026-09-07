<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_requests', function (Blueprint $table) {
            $table->unsignedInteger('working_budget')->nullable()->after('true_potential_requested');
            $table->string('budget_status')->nullable()->after('working_budget');
            $table->string('merch_package')->nullable()->after('budget_status');
            $table->unsignedSmallInteger('merch_quantity')->nullable()->after('merch_package');
            $table->unsignedInteger('merch_total')->nullable()->after('merch_quantity');
            $table->string('merch_sizes')->nullable()->after('merch_total');
            $table->string('merch_recipient')->nullable()->after('merch_sizes');
        });
    }

    public function down(): void
    {
        Schema::table('booking_requests', function (Blueprint $table) {
            $table->dropColumn([
                'working_budget', 'budget_status', 'merch_package',
                'merch_quantity', 'merch_total', 'merch_sizes', 'merch_recipient',
            ]);
        });
    }
};
