# PA LINE Booking Platform TODO

Source priority:

1. `PA_LINE_Booking_Platform_Full_Build_Spec_v1.md`
2. current legal and rider files
3. `PA_LINE_Booking_VSCode_Copilot_v50.zip` for prototype behavior
4. `PA_LINE_Booking_Platform_Requirements_v1.json`

The v50 ZIP is a standalone prototype reference. Do not extract it over this Laravel application.

## Product decisions

- [x] Use v50 travel allowance behavior: add one season-adjusted base rate only when combined driving exceeds 8 hours. Exactly 8 hours does not trigger it.

## Phase 1: domain rules and tests

- [x] Configure and test performance baselines by format and weekday.
- [x] Configure and test seasonal multipliers and rounding.
- [x] Configure and test mileage, PA LINE sound, and sound-technician charges.
- [x] Implement v50 mileage, drive-time, and extended-travel pricing.
- [x] Implement availability states and same-day scheduling buffers.
- [x] Implement recurring and multi-date calculations.
- [x] Implement budget-fit outcomes without exposing protected pricing.
- [x] Implement Route Savings events, ceilings, and election accounting.
- [x] Implement version-aware legal acknowledgment rules.

## Phase 2: production foundation

- [x] Design venue, contact, organization, booking draft, engagement, and hold models.
- [x] Add passwordless magic-link authentication.
- [x] Add venue and organization authorization.
- [x] Persist anonymous booking drafts securely across authentication.

## Phase 3: calendar and routing

- [x] Integrate the authoritative internal PA LINE engagement, hold, and block calendar.
- [x] Integrate Mapbox Directions behind a routing provider with a verification-pending fallback.
- [x] Recalculate availability for exact dates and flexible windows on the server.
- [ ] Rank flexible dates with verified server-side routing after venue geocoding.

## Phase 4: booking experience

- [x] Build the four landing paths in the existing React/Inertia application.
- [x] Add exact-date and flexible-date entry flows with recoverable anonymous drafts.
- [x] Add a persistent city-demand submission flow with explicit update consent.
- [ ] Complete venue, event, and contact details for booking drafts.
- [ ] Add venue, event, and contact suggestions that preserve manual input.
- [ ] Add recurring booking, budget, format, sound, and merch steps.

## Phase 5: secure pricing and legal

- [ ] Gate individualized pricing behind verified access and confidentiality acceptance.
- [ ] Store immutable legal document versions and acceptance audit records.
- [ ] Build one final Review & Sign checkpoint with scroll-to-unlock acknowledgments.
- [ ] Recalculate availability and price before booking submission.
- [ ] Keep TRUE POTENTIAL as a custom quote.

## Phase 6: operations

- [ ] Build the PA LINE admin booking inbox and approval workflow.
- [ ] Add quote overrides, holds, confirmations, and lifecycle management.
- [ ] Add transactional notifications and observability.
- [ ] Add browser acceptance tests and mobile accessibility QA.

## Deferred pending policy

- [ ] Deposits, balance timing, payment processor, refunds, and cancellation amounts.
- [ ] Introductory, referral, and repeat discount values and stacking.
- [ ] Venue Appreciation Credit economics.
- [ ] Final exclusivity pricing.