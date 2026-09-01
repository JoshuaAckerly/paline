
# PA LINE Booking Platform - AI Implementation Brief

You are rebuilding the PA LINE Booking Platform from the supplied stable v41 prototype and full specification.

Your job is to create a secure production application, not to copy the prototype's single-file architecture.

## Source hierarchy

Use this priority:

1. `PA_LINE_Booking_Platform_Full_Build_Spec_v1.md`
2. current legal/rider source files
3. `PA_LINE_Booking_Prototype_STABLE_v41.html` for behavioral/visual reference
4. `PA_LINE_Booking_Platform_Requirements_v1.json`

If the sources conflict, flag the conflict instead of guessing.

## Non-negotiable behaviors

- Artist name is always PA LINE.
- Landing has I KNOW MY DATE, HELP ME FIND THE SWEET SPOT, GET OVER HERE, plus full-width BACK FOR MORE?
- Available, Limited, Held, and Blocked are distinct calendar states.
- A booked date can be Limited and still requestable.
- Every performance reserves 2 hours before and 2 hours after the performance.
- Travel time is additional between engagements.
- Start times cannot be before 10:00 AM or after 11:00 PM.
- Exact-date routing suggestions never silently replace the buyer's selected date.
- User can build much of the request anonymously.
- Private individualized pricing requires verified account + accepted confidentiality agreement.
- Use passwordless magic-link authentication unless directed otherwise.
- Legal documents appear once at the final Review & Sign stage.
- Each document checkbox remains disabled until the user opens the document and scrolls to the end.
- Final price is displayed immediately before submission.
- Standard submit button repeats the final total.
- TRUE POTENTIAL remains CUSTOM QUOTE.
- Repeat-booking eligibility starts at 4+ qualifying gigs/year by venue or authorized booking contact.
- Intro/referral/repeat discount amounts are not yet defined.
- Venue Appreciation Credits are pinned but not yet economically defined.
- Predictive venue/event/contact/location suggestions must never fight manual typing.
- Server must recalculate availability and price before submission.

## Current pricing

Performance baselines:

Solo:
Sun-Tue 200, Wed-Thu 250, Fri-Sat 300

Duo:
Sun-Tue 350, Wed-Thu 450, Fri-Sat 550

Full PA LINE:
Sun-Tue 600, Wed-Thu 750, Fri-Sat 1000

Season:
Dec-Feb x0.75
Mar-Apr and Oct-Nov x1.00
May and Sep x1.25
Jun-Aug x1.40

Travel:
$0.80/mile
8 max combined drive hours per travel day
hourly drive fee currently $0
travel-day allowance = season-adjusted performance base per required travel day

Open decision:
prototype forces at least one travel day. Do not silently preserve or remove that rule without product approval.

Sound:
Solo +25 when PA LINE provides sound
Duo +50
Full PA LINE +250
Dedicated PA LINE sound tech +150 + $0.80/mile

Merch:
REP THE BAND = 2 shirts + 2 stickers + 2 pins for $40
GEAR UP THE CREW = 4 shirts + 4 stickers + 4 pins for $75
DREAM TEAM SWAG = $20 per paid shirt, min 6
10+ paid Dream Team shirts gets 1 free booker/venue-contact shirt

## Production architecture expectation

Use a real database, real authenticated sessions, real mapping/routing, real calendar synchronization, immutable legal document versions, server-side pricing, and an admin approval workflow.

A reasonable stack is TypeScript + React/Next.js + PostgreSQL, but the product requirements are more important than a specific framework.

## Do not invent

Do not decide:
- discount percentages,
- credit economics,
- deposit/payment policy,
- cancellation amounts,
- payment processor,
- final exclusivity pricing,
- final mapping vendor,
- local travel-day threshold.

Implement those as configuration or explicit TODO product decisions.

## Build order

1. domain rules + tests
2. database/auth
3. calendar/routing
4. booking UI
5. pricing/confidentiality/legal
6. admin
7. discounts/demand/merch
8. payments only after policy is approved

Before declaring done, run every acceptance test listed in the full specification.
