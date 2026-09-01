<?php

namespace Tests\Unit\Domain\Booking;

use App\Domain\Booking\AvailabilityState;
use App\Domain\Booking\RecurringDateGenerator;
use App\Domain\Booking\RecurringFrequency;
use DateTimeImmutable;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class RecurringDateGeneratorTest extends TestCase
{
    private RecurringDateGenerator $generator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->generator = new RecurringDateGenerator(24);
    }

    #[DataProvider('intervalProvider')]
    public function test_it_generates_fixed_interval_dates(
        RecurringFrequency $frequency,
        array $expected,
    ): void {
        $result = $this->generator->generate(
            new DateTimeImmutable('2026-09-01'),
            $frequency,
            3,
            fn (DateTimeImmutable $date): AvailabilityState => AvailabilityState::Available,
        );

        $this->assertSame($expected, $this->dateStrings($result->acceptedDates));
        $this->assertSame([], $result->rejectedDates);
    }

    public static function intervalProvider(): array
    {
        return [
            'weekly' => [RecurringFrequency::Weekly, ['2026-09-08', '2026-09-15', '2026-09-22']],
            'biweekly' => [RecurringFrequency::Biweekly, ['2026-09-15', '2026-09-29', '2026-10-13']],
        ];
    }

    public function test_monthly_dates_clamp_to_each_target_month(): void
    {
        $result = $this->generator->generate(
            new DateTimeImmutable('2027-01-31'),
            RecurringFrequency::Monthly,
            3,
            fn (DateTimeImmutable $date): AvailabilityState => AvailabilityState::Available,
        );

        $this->assertSame(
            ['2027-02-28', '2027-03-31', '2027-04-30'],
            $this->dateStrings($result->acceptedDates),
        );
    }

    public function test_monthly_dates_support_leap_years(): void
    {
        $result = $this->generator->generate(
            new DateTimeImmutable('2028-01-31'),
            RecurringFrequency::Monthly,
            1,
            fn (DateTimeImmutable $date): AvailabilityState => AvailabilityState::Available,
        );

        $this->assertSame(['2028-02-29'], $this->dateStrings($result->acceptedDates));
    }

    public function test_it_allows_limited_dates_and_reports_held_blocked_and_duplicate_dates(): void
    {
        $states = [
            '2026-09-08' => AvailabilityState::Limited,
            '2026-09-15' => AvailabilityState::Held,
            '2026-09-22' => AvailabilityState::Blocked,
            '2026-09-29' => AvailabilityState::Available,
        ];

        $result = $this->generator->generate(
            new DateTimeImmutable('2026-09-01'),
            RecurringFrequency::Weekly,
            4,
            fn (DateTimeImmutable $date): AvailabilityState => $states[$date->format('Y-m-d')],
            [new DateTimeImmutable('2026-09-29')],
        );

        $this->assertSame(['2026-09-08'], $this->dateStrings($result->acceptedDates));
        $this->assertSame(
            [
                '2026-09-15:held',
                '2026-09-22:blocked',
                '2026-09-29:duplicate',
            ],
            array_map(
                fn ($rejection): string => $rejection->date->format('Y-m-d').':'.$rejection->reason,
                $result->rejectedDates,
            ),
        );
    }

    #[DataProvider('invalidCountProvider')]
    public function test_it_enforces_the_additional_booking_limit(int $count): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->generator->generate(
            new DateTimeImmutable('2026-09-01'),
            RecurringFrequency::Weekly,
            $count,
            fn (DateTimeImmutable $date): AvailabilityState => AvailabilityState::Available,
        );
    }

    public static function invalidCountProvider(): array
    {
        return [[0], [25]];
    }

    private function dateStrings(array $dates): array
    {
        return array_map(fn (DateTimeImmutable $date): string => $date->format('Y-m-d'), $dates);
    }
}