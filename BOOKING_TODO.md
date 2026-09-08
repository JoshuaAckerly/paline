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
- [x] Rank flexible dates with verified server-side routing after venue geocoding.

## Phase 4: booking experience

- [x] Build the four landing paths in the existing React/Inertia application.
- [x] Add exact-date and flexible-date entry flows with recoverable anonymous drafts.
- [x] Add a persistent city-demand submission flow with explicit update consent.
- [x] Complete token-protected venue, event, and contact details for anonymous booking drafts.
- [ ] Add venue, event, and contact suggestions that preserve manual input.
- [x] Add performance format, duration, sound, and TRUE POTENTIAL request steps.
- [x] Add recurring booking generation and server-backed per-date availability review.
- [x] Add budget-fit and merch steps.
- [x] Add a way to complete/submit the booking from the recurring-dates step, with or without additional dates (interim `submitted` status ahead of the full Phase 5 secure-pricing/legal gate below).
- [x] Rebuild the booking experience as a single continuous flow (matching the v50 prototype's page structure): consolidated venue/event/contact/format/sound/TRUE POTENTIAL details, plus new Exclusivity and Technical Rider steps, plus a real (self-reported, not computed) Returning Booker Hub.

## Phase 5: secure pricing and legal

- [x] Add a versioned legal-document admin manager (server-side, immutable versions, replacing the prototype's localStorage editor). Public Review & Sign consumption of these documents is still pending below.
- [x] Gate individualized pricing behind verified access and confidentiality acceptance (`secure-access` claim + `confidentiality` accept + `/quote`, all real, no pricing exposed until confidentiality is accepted).
- [x] Store immutable legal document versions and acceptance audit records (`booking_document_reviews`, `booking_legal_acknowledgments` tables, wired to the existing `LegalAcknowledgmentService` domain layer).
- [x] Build one final Review & Sign checkpoint with scroll-to-unlock acknowledgments (`/booking-requests/{id}/documents/sign`, 4 documents + e-signature).
- [ ] Recalculate availability and price before booking submission.
- [x] Keep TRUE POTENTIAL as a custom quote.

## Phase 5b: Route Savings (new, added 2026-09-07)

- [x] Persist Route Savings events/elections (`route_savings_events`, `route_savings_elections`), wired to the existing `RouteSavingsCalculator` domain layer.
- [x] Add a minimal admin "confirm booking" action that recomputes travel ceilings for nearby confirmed bookings and emails the affected booker a link to elect (a simplified single-adjacent-leg heuristic, not full multi-stop route optimization).
- [x] Add the public Route Savings election page (presets + custom split).
- [ ] Replace the simplified heuristic with real multi-stop route-graph awareness once Phase 6's admin workflow exists.

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