
# PA LINE Booking Platform
## Full Product, Engineering, Business Logic, Security, and AI Handoff Specification

**Documentation version:** 1.0  
**Prototype source of truth:** `PA_LINE_Booking_Prototype_STABLE_v41.html`  
**Product:** PA LINE public booking platform  
**Brand owner:** PA LINE / PA LINE Music, LLC  
**Status:** Functional standalone prototype. Not production infrastructure.  
**Purpose of this document:** Give another software-building AI or engineering team enough context to rebuild the product correctly without reverse-engineering the prototype or accidentally changing established business rules.

---

# 1. Executive summary

The PA LINE Booking Platform is a guided public booking system for venues, talent buyers, promoters, event organizers, fans, and returning booking partners.

It is not meant to behave like a generic contact form. It should act like an intelligent booking assistant that:

1. helps a buyer select a workable date,
2. protects the band's calendar and routing,
3. calculates preliminary pricing from established business rules,
4. supports repeat and multi-date bookings,
5. identifies discount eligibility without exposing private rate logic too early,
6. protects negotiated pricing through a confidentiality agreement,
7. gathers technical and hospitality information,
8. offers optional post-booking merch packages,
9. requires legal documents to be opened and reviewed before acknowledgment,
10. shows the final booking-request price immediately before submission,
11. keeps the final booking subject to PA LINE approval,
12. becomes significantly faster for returning venues and booking contacts.

The current prototype is a single standalone HTML file containing HTML, CSS, JavaScript, static sample calendar data, static routing simulations, local browser memory, and embedded review copies of legal documents. It demonstrates the product behavior but does not provide real authentication, secure persistence, live mapping, live calendar synchronization, payments, server-side authorization, or production legal/audit infrastructure.

The production build should preserve the behavior and rules documented here while replacing simulated services with secure real services.

---

# 2. Non-negotiable product principles

These rules should be treated as product requirements, not suggestions.

## 2.1 PA LINE capitalization

Always display the artist name as:

**PA LINE**

Do not display "Pa Line", "Pa line", "P.A. Line", or other variants unless reproducing a source that specifically requires it.

## 2.2 Public users should not be overwhelmed

The booking experience should progressively disclose complexity. A buyer should first answer the decision that matters now, then see the next relevant step.

Do not expose every option on the landing page.

## 2.3 Anything that looks clickable must be clickable

If a card, selector, date field, option row, legal acknowledgment, or button visually looks interactive, the entire visible interactive surface should respond.

Interactive surfaces must also visibly react on hover and focus.

## 2.4 User typing always wins

Predictive text and autofill may help, but must never fight manual entry.

The current v41 behavioral rule is:

- suggestions are passive until deliberately selected,
- programmatic autofill must not recursively trigger more autofill,
- stale remote lookup results must be ignored,
- pressing Enter by itself must not silently select the first suggestion,
- arrow-key navigation plus Enter may select a highlighted suggestion,
- clicking elsewhere closes suggestions.

## 2.5 Do not reveal individualized private pricing before the secure pricing gate

A user may explore dates and build much of the booking without an account.

Before individualized negotiated pricing is exposed, the user must:

1. verify an account,
2. review the Confidential Pricing & Booking Terms Agreement,
3. scroll to the end,
4. complete the required acceptance fields.

## 2.6 Legal documents appear once

The production flow must not duplicate the Performance Agreement, Stage Plot, Technical Rider, Personal / Hospitality Rider, or electronic signature workflow on multiple pages.

The final legal review page is the single authoritative document checkpoint.

## 2.7 Documents cannot be acknowledged without review

Each required legal document must be opened in the application and scrolled to its end before its acknowledgment checkbox becomes enabled.

The checkbox must remain visibly locked before completion and visibly highlight once unlocked.

## 2.8 The final price belongs immediately before submission

The authoritative booking-request total must be displayed on the final Review & Sign screen immediately before the submission control.

The submit control should repeat the amount when the amount is known, for example:

`REQUEST BOOKING · $1,275`

If TRUE POTENTIAL requires a custom quote, do not manufacture a fixed performance total.

## 2.9 A booked date is not automatically unavailable

An existing PA LINE engagement makes the date **Limited**, not automatically unavailable.

A second booking may still be requested when the entire day can safely accommodate:

- 2 hours before each PA LINE performance,
- the full performance duration,
- 2 hours after each PA LINE performance,
- travel time between engagements,
- valid performance start times.

## 2.10 Final scheduling buffer rule

Every PA LINE show reserves:

**2 hours before performance start + performance duration + 2 hours after performance end + applicable travel between engagements.**

This is the final rule. Do not reinterpret the two-hour periods as one combined two-hour buffer.

## 2.11 Performance start-time limits

Performance start times must never be offered before:

**10:00 AM**

and never later than:

**11:00 PM**

## 2.12 A booking request is not automatically a confirmed booking

Submission means a request has been sent to PA LINE.

The product must make clear that the request is not fully confirmed until PA LINE accepts it and required contract/payment conditions have been satisfied.

---

# 3. Product audiences and roles

## 3.1 Anonymous prospective booker

Can:

- browse the landing paths,
- check date availability,
- use flexible date search,
- build initial event details,
- view route guidance,
- select format and sound configuration,
- explore recurring booking options.

Cannot receive protected individualized pricing until verified.

## 3.2 Verified booking contact

A human user authenticated through passwordless email.

Can be associated with:

- one venue,
- multiple venues,
- an organization,
- previous booking requests,
- confirmed bookings,
- negotiated rates,
- signed documents,
- repeat-booking eligibility.

## 3.3 Venue

A venue is a persistent business entity and should not be treated as identical to a contact.

A venue can have multiple authorized booking contacts.

A contact can manage multiple venues.

## 3.4 Fan

Uses the GET OVER HERE demand-building flow.

## 3.5 Local connector

A person who may know venues, promoters, organizers, or useful local contacts.

## 3.6 Venue / promoter demand participant

A demand-flow participant with more direct ability to facilitate a booking.

## 3.7 PA LINE administrator

Production-only role.

Should eventually have access to:

- booking requests,
- calendar,
- holds,
- confirmed dates,
- routing,
- quote approval,
- negotiated prices,
- discount overrides,
- repeat-booking status,
- legal acceptance audit trail,
- contracts,
- technical advance information,
- merch add-ons,
- demand heat map,
- venue/contact records,
- production notes,
- notifications,
- booking lifecycle management.

---

# 4. Landing-page architecture

The visual baseline uses three equal primary cards side by side on desktop. Narrow screens should allow horizontal behavior or an intentionally redesigned mobile presentation without compressing cards into unreadable columns.

## 4.1 Primary path: I KNOW MY DATE

Display copy:

**I KNOW MY DATE**

"You know the day. Check availability and start building the show."

CTA:

**LET'S CHECK IT**

Purpose:

- buyer already knows the desired date,
- show calendar,
- classify date,
- allow Available or Limited dates to progress,
- retain chosen date unless buyer deliberately changes it.

## 4.2 Primary path: HELP ME FIND THE SWEET SPOT

Display copy:

**HELP ME FIND THE SWEET SPOT**

"Give us a window and we'll find dates that fit the schedule, route better, and waste less travel."

CTA:

**FIND THE SWEET SPOT**

Purpose:

- buyer has a window or season,
- system recommends route-friendly dates,
- suggestions consider availability, routing, flexibility, and preferred weekdays.

## 4.3 Primary path: GET OVER HERE

Display copy:

**GET OVER HERE**

"No date yet? No problem. Tell us where you want PA LINE and help turn local interest into a real show."

CTA:

**START SOME TROUBLE**

Purpose:

- collect demand before there is a real booking date,
- identify local interest,
- collect likely attendance signal,
- gather possible venues and local connectors,
- build data for future routing and booking outreach.

## 4.4 Full-width returning-booker path

Under the three main options, use a full-width returning path.

Current copy:

**BACK FOR MORE?**

"Already brought PA LINE in before? Sign in, pull up your venue, and make the next one faster."

CTA:

**BRING US BACK**

Purpose:

- passwordless account access,
- load known venue/contact/history data,
- provide fast repeat-booking entry,
- make multi-show series easier.

---

# 5. Returning-booker flow

## 5.1 Authentication approach

Recommended production behavior:

**Passwordless email magic link**

Do not require users to create and remember a traditional password unless a later business requirement demands it.

Reasons:

- lower friction,
- still verifies control of the email address,
- easier for occasional venue buyers,
- appropriate for a booking portal that may only be used a few times per year.

## 5.2 Returning access fields

- email used for prior PA LINE bookings,
- venue / organization.

In production, do not trust venue text alone for authorization. The verified account must be linked server-side to authorized organizations/venues.

## 5.3 Returning portal options

### BOOK ANOTHER DATE

Reuse known venue information and select a new exact date.

### FIND OUR NEXT SWEET SPOT

Reuse venue information and use flexible date/routing discovery.

### MAKE IT A THING

Start a multi-date or recurring series and surface repeat-booking eligibility.

## 5.4 Returning venue profile

Expected saved data:

- venue name,
- address,
- city,
- state,
- ZIP,
- contacts,
- production notes,
- prior show count,
- previous technical accommodations,
- previous event names,
- negotiated information accessible only when authorized,
- previous signed documents,
- booking history.

---

# 6. Account and authorization model

The production system should use separate database entities for users, organizations, venues, and authorization relationships.

Do not store confidential booking history only in browser localStorage.

Suggested relationship model:

```text
User
  -> UserOrganizationRole
      -> Organization
          -> Venue
          -> Booking
          -> Contact
```

Possible roles:

- owner,
- administrator,
- booking_contact,
- production_contact,
- accounting_contact,
- viewer.

A user should only see confidential records for organizations/venues they are authorized to access.

---

# 7. Exact-date calendar

## 7.1 Booking horizon

Current prototype supports dates up to:

**24 months**

Past dates are blocked.

Dates more than 12 months out may still be requested, but pricing and certain terms may reasonably be reviewed as the event approaches.

## 7.2 Date states

The calendar must support at least:

### Available

No known blocking conflict.

### Limited

There is already a PA LINE engagement on that date, but a second booking may be possible.

### Held

A private or temporary hold exists.

### Blocked / Unavailable

The date cannot currently be requested.

## 7.3 Privacy rule

Public availability should never expose confidential details from unrelated private bookings.

A public user may be told that a date is Held, Limited, or Unavailable without being given private contractual details.

## 7.4 Current prototype calendar snapshot

The prototype contains a static snapshot used for demonstration. It is not a live sync.

Production must replace this with the real PA LINE booking calendar integration.

Never tell a production user that static prototype data is live.

## 7.5 Date picker

The prototype uses an in-app date picker rather than relying exclusively on the browser-native picker.

Requirements:

- clicking the visible calendar control opens it,
- clicking the date field surface opens it,
- month navigation works,
- valid min/max dates are respected,
- selected date updates the underlying field,
- keyboard and mobile behavior remain usable.

---

# 8. Limited-date and same-day scheduling algorithm

This is one of the highest-risk business rules in the system.

## 8.1 Constants

```text
Earliest performance start: 10:00 AM
Latest performance start: 11:00 PM
Pre-show allowance: 120 minutes
Post-show allowance: 120 minutes
Default preliminary performance duration: 90 minutes
```

## 8.2 Existing events

For every existing engagement on the requested date, calculate:

```text
existing_reserved_start =
existing_performance_start - 120 minutes

existing_reserved_end =
existing_performance_end + 120 minutes
```

Normalize events that cross midnight.

## 8.3 Candidate new engagement

The candidate show reserves:

```text
candidate_reserved_start =
candidate_performance_start - 120 minutes

candidate_reserved_end =
candidate_performance_end + 120 minutes
```

Travel time between the new engagement and existing engagement must fit between those reserved windows.

## 8.4 Preliminary Limited-date modal

Before the new venue location is known:

- show existing engagement timing,
- show preliminary possible start windows,
- assume a 90-minute new performance,
- state clearly that travel is not yet known,
- disable the request action if no safe preliminary window exists.

## 8.5 Final same-day validation

After the buyer enters:

- venue,
- city,
- state,
- ZIP,
- start time,
- end time,

recalculate the same-day window including routed travel.

The Details continuation button must remain disabled if the requested start time does not fall inside a valid same-day window.

## 8.6 Production implementation requirement

The current prototype uses simulated travel.

Production must use:

- actual coordinates,
- actual road travel estimates,
- time-feasible previous/next commitments,
- real show locations,
- appropriate border/ferry/traffic considerations where relevant.

Do not rely on hashed pseudo-mileage.

---

# 9. Flexible date discovery

## 9.1 Input modes

### Rough Date Range

Fields:

- earliest date,
- latest date.

### Season

Options:

- Winter,
- Spring,
- Summer,
- Fall,
- year.

## 9.2 Additional inputs

- venue / organization,
- city,
- state,
- ZIP,
- flexibility level,
- optional preferred weekdays.

## 9.3 Current prototype ranking formula

The v41 prototype uses the following conceptual score:

```text
score = 100
      - route_total_miles / 4
      - 35 if date is Limited
      + 15 if preferred weekday matches
      - 15 if preferred weekdays were supplied and date does not match
```

It returns up to five recommendations.

## 9.4 Production scoring should be extensible

A production scoring engine should support weighted inputs such as:

- route miles,
- actual travel time,
- same-day safety,
- previous show,
- next show,
- venue market,
- weekday preference,
- season,
- available crew,
- existing hold status,
- lodging implications,
- tour direction,
- repeat relationship,
- potential demand score.

Do not hard-code every ranking decision into front-end UI code.

---

# 10. Exact-date route optimization suggestions

Once an exact date is selected and the venue location is known, the system may optionally suggest nearby dates if they route substantially better.

Important behavior:

- the originally selected date remains selected,
- do not silently move the buyer,
- suggestions are optional,
- only present clearly meaningful improvements,
- the user explicitly chooses an alternate.

The current prototype looks roughly three days before and after the selected date and suggests an alternate when prototype mileage improves by more than about 15 miles.

Production may improve this rule using real routing and schedule data.

---

# 11. Event-details model

The primary booking details page collects the following categories.

## 11.1 Identity

- selected date,
- venue name,
- event name,
- street address,
- city,
- state,
- ZIP.

Venue name and event name are separate concepts.

Example:

```text
Venue: Delaware Park
Event: Taste of Buffalo
```

Do not merge these into one database field.

## 11.2 Event classification

- public performance,
- festival,
- private event,
- corporate event,
- wedding,
- fundraiser,
- other.

## 11.3 Setting

- indoor,
- outdoor,
- indoor / outdoor,
- not sure yet.

## 11.4 Performance timing

- start time,
- end time,
- performance length,
- timing notes.

## 11.5 Attendance

Estimated attendance.

## 11.6 Performance format

### Solo

Trever Stribing solo.

### Duo

Stripped-down PA LINE duo.

### Full PA LINE

Full-band PA LINE experience.

---

# 12. Sound and production logic

## 12.1 Primary sound choice

### Sound Is Provided

The venue/event has a suitable PA system.

### Sound Is Not Provided

PA LINE will provide sound.

## 12.2 House engineer

Ask whether a qualified house engineer is included.

If house sound is available but a qualified engineer is not included, the system may require or recommend a dedicated PA LINE sound technician.

## 12.3 Format-based PA LINE sound fee

If PA LINE supplies sound:

| Format | Sound fee |
|---|---:|
| Solo | $25 |
| Duo | $50 |
| Full PA LINE | $250 |

If suitable house sound is provided, format-based sound fee is $0.

## 12.4 Dedicated sound technician

Current rules:

```text
Sound technician base fee: $150
Sound technician mileage: $0.80/mile
```

A dedicated technician is automatically treated as needed for Full PA LINE in the prototype when:

- PA LINE supplies sound, or
- house sound exists but the venue has no qualified engineer.

The production system should allow PA LINE staff to override this when appropriate.

---

# 13. TRUE POTENTIAL premium production

TRUE POTENTIAL is not a normal fixed-price add-on.

It is a custom production project.

## 13.1 Eligibility

Current baseline:

**6 or more months advance booking**

If the date is closer than six months, standard booking can continue, but TRUE POTENTIAL should not be treated as eligible by default.

## 13.2 Possible creative additions

- horn section,
- string section,
- keys,
- additional vocals,
- additional percussion,
- guest artist,
- custom arrangements,
- expanded lighting,
- custom staging / visuals,
- let PA LINE design the lineup.

## 13.3 Production expectations

The current business concept includes:

- dedicated sound engineer,
- stage hands,
- appropriate security,
- uninterrupted soundcheck the morning of or day before,
- dedicated lighting director and equipment,
- peak-optimal audio within practical room constraints,
- coordinated promotional campaign,
- street team,
- three paid rehearsals,
- custom creative personnel as quoted.

## 13.4 Pricing behavior

TRUE POTENTIAL should display:

**CUSTOM QUOTE**

Do not generate a fake automatic total for the production package.

Known non-TRUE-POTENTIAL add-ons may still be shown separately.

---

# 14. Recurring, repeat, and multi-date booking

## 14.1 Entry point

Event details includes:

**ADD MORE DATES**

## 14.2 Booking types

The system should support concepts including:

- repeat booking,
- recurring series,
- continuous / residency relationship.

## 14.3 Date input modes

### Specific dates

Buyer adds dates individually.

### Weekly

Auto-generate every 7 days.

### Every other week

Auto-generate every 14 days.

### Monthly

Add month increments while clamping invalid dates to the last valid day of the target month.

## 14.4 Maximum

Current prototype maximum:

**24 additional bookings**

## 14.5 Validation

Reject:

- past dates,
- duplicate dates,
- primary booking date,
- held dates,
- blocked dates.

Allow:

- Available dates,
- Limited dates, subject to same-day scheduling validation.

## 14.6 Pricing requirement

Each date must eventually have its own:

- seasonal base,
- routing,
- mileage,
- travel-day allowance,
- sound configuration,
- sound technician costs,
- production requirements.

Do not apply the primary date's quote to every date.

## 14.7 Current prototype limitation

The current final-price display only prices the primary performance automatically. Additional recurring dates remain subject to date-specific calculation before final acceptance.

The production build must resolve this and calculate every date before the final multi-date total is presented.

---

# 15. Baseline performance pricing

## 15.1 Day-of-week baseline

### Solo

| Day | Baseline |
|---|---:|
| Sunday | $200 |
| Monday | $200 |
| Tuesday | $200 |
| Wednesday | $250 |
| Thursday | $250 |
| Friday | $300 |
| Saturday | $300 |

### Duo

| Day | Baseline |
|---|---:|
| Sunday | $350 |
| Monday | $350 |
| Tuesday | $350 |
| Wednesday | $450 |
| Thursday | $450 |
| Friday | $550 |
| Saturday | $550 |

### Full PA LINE

| Day | Baseline |
|---|---:|
| Sunday | $600 |
| Monday | $600 |
| Tuesday | $600 |
| Wednesday | $750 |
| Thursday | $750 |
| Friday | $1,000 |
| Saturday | $1,000 |

---

# 16. Seasonal pricing

Apply the seasonal multiplier to the baseline performance fee.

| Months | Multiplier | Meaning |
|---|---:|---|
| December, January, February | 0.75 | 25% below baseline |
| March, April, October, November | 1.00 | baseline |
| May, September | 1.25 | 25% above baseline |
| June, July, August | 1.40 | 40% above baseline |

Formula:

```text
season_adjusted_base =
round(day_of_week_baseline * seasonal_multiplier)
```

---

# 17. Travel and routing pricing

## 17.1 Home base

Current business routing home base:

**Depew, NY**

Production should store the exact routing origin as secured configuration rather than hard-coding it throughout the UI.

## 17.2 Mileage

```text
Mileage rate = $0.80 per routed mile
```

## 17.3 Routing concept

For a booking date:

```text
inbound origin =
previous confirmed PA LINE engagement
OR home base if no previous engagement

outbound destination =
next confirmed PA LINE engagement
OR home base if no next engagement
```

The routed mileage associated with the booking is:

```text
inbound leg + outbound leg
```

## 17.4 Driving time

Current prototype average:

```text
55 mph
```

This is simulation only.

Production should use actual route duration from a mapping provider.

## 17.5 Maximum driving allocation

```text
8 hours combined driving per travel day
```

## 17.6 Travel-day allowance

Current concept:

```text
travel_days =
ceil(combined_drive_hours / 8)
```

Each required travel day adds a flat travel allowance equal to the season-adjusted base performance rate.

```text
travel_day_allowance =
season_adjusted_base * travel_days
```

Mileage is separate.

## 17.7 Hourly drive-time fee

Current configured value:

```text
$0/hour
```

Do not invent an hourly travel rate unless PA LINE sets one.

## 17.8 Known unresolved issue

The current prototype forces:

```text
travel_days >= 1
```

even for very short local routing.

That may create a full travel-day allowance for a local booking.

This rule has not been finalized and must be treated as an open business decision before production pricing is locked.

Do not silently change it.

---

# 18. Preliminary quote formula

For a standard booking:

```text
season_adjusted_base
+ routed_mileage_cost
+ hourly_drive_time_cost
+ travel_day_allowance
+ sound_fee
+ sound_technician_total
= preliminary_standard_quote
```

Then later include applicable approved:

- exclusivity fee,
- merch add-ons,
- discounts or credits,
- other approved charges/credits.

TRUE POTENTIAL remains custom quoted.

---

# 19. Exclusivity / radius request

Buyer may choose:

### No Exclusivity

No geographic/time restriction.

### Request Exclusivity

Collect:

- radius,
- days before,
- days after,
- covered appearances,
- exceptions.

## 19.1 Prototype estimate

The current prototype calculates an opportunity-cost estimate from radius and total days, with a minimum of roughly $100.

This is explicitly a prototype estimator.

## 19.2 Production rule

Final exclusivity pricing should be manually reviewable by PA LINE.

Do not expose confidential radius terms from unrelated contracts or bookings.

---

# 20. Preferred-pricing and discount programs

The current system identifies eligibility but intentionally does not hard-code final percentages or dollar values.

## 20.1 Introductory venue discount

Potential eligibility when this is the venue's first PA LINE booking.

## 20.2 New-venue referral discount

Potential eligibility when:

- the venue is new to PA LINE,
- a valid referring venue, booker, or referral code is supplied.

## 20.3 Repeat-booking discount

Eligibility concept:

**4 or more gigs per year**

Qualification can be associated with either:

- the venue, or
- the authorized booking person.

The current qualifying count concept is:

```text
prior confirmed qualifying shows
+ primary requested show
+ additional dates in the current request
```

When count reaches 4, mark repeat-booking eligibility.

## 20.4 Discounts are not finalized

The following remain open:

- actual introductory discount amount,
- actual referral discount amount,
- actual repeat-booking discount amount,
- whether discounts stack,
- maximum combined discount,
- whether discount applies to performance base only or other charges,
- timing of approval,
- whether cancelled dates count,
- whether credits and discounts can be combined.

The production code must make these values configurable, not hard-coded into UI components.

## 20.5 Venue Appreciation Credit System

**Pinned concept. Not implemented yet.**

Concept:

Each booking could earn credits redeemable for:

- PA LINE store merchandise,
- future booking value,
- selected benefits.

Do not implement a final economic model until rules are deliberately defined.

Potential future fields:

```text
credit_account_id
earned_credits
available_credits
pending_credits
expiration_date
redemption_type
redemption_booking_id
redemption_order_id
reason
audit_entry
```

---

# 21. Booking-only merch upsells

These appear after the core show package is built.

They are optional and should remain visually separate from the negotiated performance fee.

Standard shirt retail price:

**$25**

Approximate shirt cost:

**$15**

## 21.1 REP THE BAND!

Booking-only price:

**$40**

Includes:

- 2 PA LINE shirts,
- 2 stickers,
- 2 pins.

Regular shirt-only retail value:

$50.

Intended audience:

- venue owner and partner,
- booking contact and partner.

## 21.2 GEAR UP THE CREW

Booking-only price:

**$75**

Includes:

- 4 PA LINE shirts,
- 4 stickers,
- 4 pins.

Regular shirt-only retail value:

$100.

## 21.3 DREAM TEAM SWAG

Booking-only price:

**$20 per paid shirt**

Minimum:

**6 paid shirts**

Each includes:

- sticker,
- pin.

At 10 or more paid shirts:

**1 extra shirt free for the primary booker / venue contact.**

## 21.4 Merch UX

Collect:

- quantity where applicable,
- shirt sizes,
- intended recipients.

The user must be able to select:

**NO THANKS**

Merch should be shown as a separate line item in final review.

## 21.5 Production fulfillment

Production should eventually connect this to:

- inventory,
- SKU/variant system,
- shirt size availability,
- order record,
- show-date fulfillment,
- shipping/pickup status,
- sales tax rules where applicable.

---

# 22. GET OVER HERE demand-building flow

## 22.1 Inputs

- city,
- state,
- ZIP,
- preferred venue,
- alternate venue,
- likely attendees,
- notes,
- requester name,
- email,
- phone,
- preferred updates,
- requester role,
- offered momentum actions.

## 22.2 Roles

- Fan,
- Local Connector,
- Venue / Promoter.

## 22.3 Prototype demand score

Current conceptual scoring:

```text
score = likely_attendee_signal

+ 8 if Local Connector
+ 15 if Venue / Promoter
+ 3 per selected momentum action
+ 4 if preferred venue supplied
+ 2 if alternate venue supplied
```

Current levels:

```text
30+ = HIGH
15-29 = GROWING
below 15 = STARTING
```

## 22.4 Future lifecycle

Suggested demand progression:

```text
Demand Building
-> Venue Outreach
-> Date Being Discussed
-> Hold Placed
-> Show Confirmed
-> Tickets Available
```

## 22.5 Production opportunity

When PA LINE has a confirmed route near a high-demand city, the admin system should surface that market as a routing opportunity.

---

# 23. Predictive text and autofill system

The production goal is to reduce repetitive data entry without taking control away from the user.

## 23.1 Location intelligence

### City typing

Predict cities.

Selecting a city may fill:

- state,
- ZIP.

### ZIP typing

A complete ZIP may fill:

- city,
- state.

### Address typing

Predict address candidates.

Selecting a result may fill:

- street address,
- city,
- state,
- ZIP.

## 23.2 Venue predictive text

Typing a venue should suggest:

- known PA LINE venues,
- previously saved venues,
- external venue/place results when available.

Selecting a venue may fill:

- venue name,
- street address,
- city,
- state,
- ZIP.

Future account-backed data may also include:

- production notes,
- contact records,
- previous technical accommodations.

## 23.3 Event-name predictive text

Event name is separate from venue.

Typing an event can suggest known or previously saved events.

Selecting a known event may refill known:

- event name,
- venue,
- city/state/ZIP,
- event type,
- setting,
- attendance,
- start/end times.

## 23.4 Contact-name predictive text

Typing a saved booker/contact name may fill:

- email,
- phone,
- organization,
- linked venue.

## 23.5 Prototype browser memory

The standalone prototype uses browser localStorage for remembered:

- venues,
- contacts,
- events.

Production must migrate this to authenticated server-side data.

Browser localStorage must not be considered a secure source for confidential negotiated information.

## 23.6 v41 responsiveness rules

The v41 interaction architecture specifically fixes earlier glitchy behavior.

Implementation requirements:

- never trigger remote search for every keystroke without debounce,
- minimum characters before suggestions,
- remote lookups occur after typing pause,
- local results can appear before remote results,
- do not replace a visible result list with a disruptive loading state,
- cancel or ignore stale async results,
- programmatic changes carry an autofill marker,
- autofill events must not recursively call city/ZIP/address lookup,
- Enter alone preserves manual text,
- Up/Down arrows move the highlighted suggestion,
- Enter selects only when a suggestion is actually highlighted,
- Escape closes the list,
- clicking outside closes the list,
- selected suggestion closes its list,
- only one relevant suggestion list should remain open.

---

# 24. Secure pricing gate

Before individualized private pricing:

## 24.1 Verify account

Collect:

- name,
- business email,
- venue / organization.

Production sends a secure one-time email link.

The standalone prototype simulates this action only.

## 24.2 Confidential Pricing & Booking Terms Agreement

The user must:

1. open the confidentiality agreement,
2. scroll to the end,
3. unlock the acceptance fields,
4. provide authorized signer name,
5. provide title/role,
6. accept confidentiality,
7. accept electronic-signature intent.

Only then should the private quote unlock.

## 24.3 Scope

The agreement is intended to protect non-public:

- negotiated pricing,
- discounts,
- guarantees,
- custom concessions,
- routing arrangements,
- travel allowances,
- production charges,
- exclusivity pricing,
- preferred-pricing offers,
- other non-public deal terms.

## 24.4 Legal warning

The current language is a business-rule draft.

Before production, qualified counsel should review the confidentiality and performance-agreement language.

Do not describe any legal document as guaranteed enforceable or loophole-proof.

---

# 25. Technical review

After exclusivity, the user reviews technical requirements.

Primary choices:

### Yes

Requirements can be accommodated.

### Needs Discussion

Something requires an alternate arrangement or advance conversation.

Collect free-form issues when needed.

The Technical Rider remains the authoritative source for detailed requirements.

---

# 26. Final contact check

Before legal review, collect or confirm:

- name,
- email,
- phone,
- organization / venue,
- preferred contact method,
- notes.

This page is not a second legal page.

It is only a contact and booking-summary checkpoint.

---

# 27. Single final Review & Sign page

This is the authoritative legal submission checkpoint.

It must contain the only final set of:

- Performance Agreement review,
- Stage Plot review,
- Technical Rider review,
- Personal / Hospitality Rider review,
- electronic signature,
- final acknowledgment,
- final price.

The confidentiality agreement is accepted earlier and can be shown here as already completed, but should not be duplicated for another signature unless legal counsel later requires it.

---

# 28. Scroll-to-unlock legal acknowledgment

For each required document:

1. checkbox starts disabled,
2. card appears visually locked,
3. user clicks OPEN & REVIEW,
4. document opens inside the app,
5. scroll progress is tracked,
6. user must reach the bottom,
7. system marks document reviewed,
8. checkbox becomes enabled,
9. acknowledgment visibly highlights,
10. user must manually check it.

This applies to:

- Performance Agreement,
- Stage Plot,
- Technical Rider,
- Personal / Hospitality Rider.

It also applies to the confidentiality agreement before its acceptance controls become enabled.

## 28.1 Important legal implementation detail

Do not consider a browser scroll event alone to be a legally sufficient proof of informed consent.

For production, maintain an audit trail such as:

```text
document_version_id
document_hash
opened_at
reached_end_at
acknowledged_at
user_id
booking_id
ip_address where lawful/appropriate
user_agent
signature_timestamp
signature_name
signature_role
```

The final legal implementation should follow attorney guidance and applicable e-signature law.

---

# 29. Electronic signature

Final signature fields:

- full legal name,
- title / role,
- typed signature,
- date,
- electronic signature consent,
- final acknowledgment.

Current behavior expects typed signature to match the full legal name.

Production should store:

- signer identity,
- signer authority,
- exact document versions,
- acceptance timestamps,
- immutable audit record.

---

# 30. Final price confirmation

The final price must appear on the Review & Sign screen immediately before submission.

For a standard booking, show line items such as:

- performance + routing + production,
- exclusivity,
- booking-only merch,
- approved credits/discounts when implemented,
- final request total.

The submit button should repeat the final amount.

Example:

```text
FINAL REQUEST TOTAL
$1,275

REQUEST BOOKING · $1,275
```

For TRUE POTENTIAL:

```text
TRUE POTENTIAL PERFORMANCE PACKAGE
CUSTOM QUOTE
```

Known add-ons may be displayed separately.

---

# 31. Pricing confidentiality and public display strategy

The product contains two pricing concepts:

1. system rules used to calculate preliminary prices,
2. individual negotiated/private terms.

Production should decide which general rates, if any, are public marketing information.

Do not expose:

- another venue's negotiated rate,
- another venue's discounts,
- private deal concessions,
- confidential booking history.

---

# 32. Legal source documents

The handoff package includes the current source documents used by the prototype:

- `PA_LINE_Performance_Agreement_2026_Fillable.docx`
- `PA_LINE_2026_Stage_Plot.html`
- `PA_LINE_2026_Technical_Rider.html`
- `PA_LINE_2026_Personal_Hospitality_Rider.html`

Treat those files as the legal/document-content source of truth until intentionally revised.

Do not rewrite contract terms while merely refactoring application code.

---

# 33. Branding and visual system

## 33.1 Overall style

Premium dark / black visual direction.

Warm gold accent.

Subtle grid/textural background.

Strong cards and clear interactive affordances.

## 33.2 Rose artwork

The application uses the actual PA LINE rose artwork.

Landing visual identities:

- exact-date path: warm gold,
- flexible-date path: teal / green,
- demand path: rose / magenta.

## 33.3 Asset optimization

The prototype evolved from repeatedly embedding artwork to a more efficient method:

- transparent line-art representation,
- reduced web dimensions,
- embedded/referenced once,
- reused across rose elements.

Production should use normal optimized static assets or CDN delivery rather than giant repeated base64 strings.

## 33.4 PEACE ALWAYS

"PEACE ALWAYS" may appear subtly in brand/footer presentation where appropriate.

---

# 34. Accessibility requirements

Production should meet practical WCAG expectations.

At minimum:

- semantic buttons for actual buttons,
- keyboard focus indicators,
- Enter/Space on card-style controls where appropriate,
- no interaction that requires hover only,
- sufficient contrast,
- readable mobile font sizes,
- form labels attached to controls,
- error text understandable without color alone,
- modal focus management,
- Escape support for dismissible dialogs,
- focus trap in modal/legal review dialog,
- restore focus to invoking control after closing,
- aria labels for icon-only controls,
- reduced-motion support.

The current standalone prototype approximates some of this but is not a full accessibility certification.

---

# 35. Suggested production data model

The following is a recommended starting point, not an existing database.

## 35.1 User

```ts
type User = {
  id: string
  email: string
  emailVerifiedAt: Date | null
  displayName: string | null
  phone: string | null
  createdAt: Date
  updatedAt: Date
}
```

## 35.2 Organization

```ts
type Organization = {
  id: string
  name: string
  type: "venue_operator" | "promoter" | "festival" | "private_buyer" | "other"
  createdAt: Date
}
```

## 35.3 Venue

```ts
type Venue = {
  id: string
  organizationId: string | null
  name: string
  streetAddress: string | null
  city: string
  state: string
  postalCode: string | null
  country: string
  latitude: number | null
  longitude: number | null
  productionNotes: string | null
  active: boolean
}
```

## 35.4 UserOrganizationRole

```ts
type UserOrganizationRole = {
  userId: string
  organizationId: string
  role: "owner" | "admin" | "booking_contact" | "production_contact" | "accounting" | "viewer"
}
```

## 35.5 BookingRequest

```ts
type BookingRequest = {
  id: string
  requesterUserId: string | null
  venueId: string | null
  eventName: string | null
  sourcePath: "exact" | "flexible" | "returning"
  status: BookingStatus
  primaryDate: string
  eventStart: string
  eventEnd: string
  eventType: string
  setting: string
  estimatedAttendance: number | null
  performanceFormat: "solo" | "duo" | "full_band"
  performanceLengthMinutes: number | null
  soundProvided: boolean
  houseEngineerProvided: boolean | null
  truePotentialRequested: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 35.6 BookingDate

For recurring/multi-date booking:

```ts
type BookingDate = {
  id: string
  bookingRequestId: string
  date: string
  startTime: string
  endTime: string
  availabilityStatus: string
  routeSnapshotId: string | null
  pricingSnapshotId: string | null
}
```

## 35.7 RouteSnapshot

```ts
type RouteSnapshot = {
  id: string
  bookingDateId: string
  inboundOriginBookingId: string | null
  outboundDestinationBookingId: string | null
  inboundMiles: number
  outboundMiles: number
  totalMiles: number
  totalDriveMinutes: number
  travelDays: number
  provider: string
  providerPayloadRef: string | null
  calculatedAt: Date
}
```

## 35.8 PricingSnapshot

```ts
type PricingSnapshot = {
  id: string
  bookingDateId: string
  baseRate: number
  seasonalMultiplier: number
  seasonalBase: number
  mileageRate: number
  mileageCost: number
  travelDayCount: number
  travelDayAllowance: number
  soundFee: number
  soundTechFee: number
  soundTechMileage: number
  exclusivityFee: number
  discounts: number
  credits: number
  merchTotal: number
  customQuoteRequired: boolean
  total: number | null
  ruleVersion: string
  createdAt: Date
}
```

## 35.9 DiscountEligibility

```ts
type DiscountEligibility = {
  id: string
  bookingRequestId: string
  program: "introductory" | "referral" | "repeat"
  eligible: boolean
  reason: string
  amountType: "percentage" | "fixed" | "manual" | null
  amount: number | null
  approvedByUserId: string | null
}
```

## 35.10 LegalDocumentVersion

```ts
type LegalDocumentVersion = {
  id: string
  type: "confidentiality" | "performance_agreement" | "stage_plot" | "technical_rider" | "hospitality_rider"
  versionLabel: string
  contentHash: string
  storageKey: string
  effectiveAt: Date
  retiredAt: Date | null
}
```

## 35.11 LegalAcceptance

```ts
type LegalAcceptance = {
  id: string
  bookingRequestId: string
  userId: string | null
  documentVersionId: string
  openedAt: Date
  reachedEndAt: Date | null
  acknowledgedAt: Date | null
  signerName: string | null
  signerTitle: string | null
  signatureText: string | null
  signatureDate: string | null
}
```

## 35.12 DemandRequest

```ts
type DemandRequest = {
  id: string
  city: string
  state: string
  postalCode: string | null
  preferredVenueName: string | null
  alternateVenueName: string | null
  likelyAttendees: number
  requesterRole: "fan" | "connector" | "venue_promoter"
  requesterName: string
  requesterEmail: string
  requesterPhone: string | null
  momentumActions: string[]
  score: number
  status: string
}
```

## 35.13 MerchAddon

```ts
type MerchAddon = {
  id: string
  bookingRequestId: string
  packageCode: "rep" | "crew" | "dream"
  paidShirtQty: number
  freeShirtQty: number
  unitPrice: number | null
  total: number
  sizeRequest: string
  recipientType: string
}
```

---

# 36. Recommended booking lifecycle

Suggested statuses:

```text
draft
account_verification_required
confidentiality_required
quote_generated
awaiting_technical_review
awaiting_documents
submitted
under_review
needs_changes
hold_placed
approved_pending_contract_or_payment
confirmed
declined
cancelled
completed
```

Use explicit state transitions. Do not infer critical booking state from which page the user last viewed.

---

# 37. Recommended API boundaries

The exact framework may vary, but the business capabilities should be separated.

## 37.1 Authentication

```text
POST /auth/magic-link
GET  /auth/callback
POST /auth/logout
GET  /me
```

## 37.2 Venue and contacts

```text
GET  /venues/search
GET  /venues/:id
POST /venues
PATCH /venues/:id

GET  /contacts/search
GET  /organizations/:id/contacts
```

## 37.3 Geocoding and places

```text
GET /locations/cities
GET /locations/postal/:zip
GET /locations/addresses
GET /places/search
```

These server endpoints can proxy whichever provider is chosen and keep provider API keys off the client.

## 37.4 Calendar and availability

```text
GET  /availability?from=&to=
POST /availability/check
POST /availability/same-day-check
```

## 37.5 Routing

```text
POST /routing/calculate
POST /routing/suggest-dates
```

## 37.6 Booking

```text
POST  /booking-requests
GET   /booking-requests/:id
PATCH /booking-requests/:id
POST  /booking-requests/:id/dates
DELETE /booking-requests/:id/dates/:dateId
POST  /booking-requests/:id/submit
```

## 37.7 Pricing

```text
POST /booking-requests/:id/price
POST /booking-requests/:id/discount-eligibility
POST /booking-requests/:id/exclusivity-estimate
```

## 37.8 Legal

```text
GET  /legal/documents/current
GET  /legal/documents/:id
POST /booking-requests/:id/legal/:documentId/open
POST /booking-requests/:id/legal/:documentId/reached-end
POST /booking-requests/:id/legal/:documentId/acknowledge
POST /booking-requests/:id/sign
```

## 37.9 Demand

```text
POST /demand
GET  /admin/demand/markets
```

## 37.10 Admin

```text
GET  /admin/bookings
POST /admin/bookings/:id/approve
POST /admin/bookings/:id/decline
POST /admin/bookings/:id/hold
POST /admin/bookings/:id/price-override
POST /admin/bookings/:id/discount
```

---

# 38. Recommended production architecture

This section is a recommendation, not a requirement of the current prototype.

A practical production implementation could use:

## Front end

- TypeScript
- React
- Next.js or equivalent
- accessible component system
- form schema validation
- server-backed session/authentication.

## Back end

- server-side TypeScript or another strongly supported web backend,
- PostgreSQL,
- ORM such as Prisma/Drizzle or equivalent,
- transactional writes around booking submission and pricing snapshots.

## Authentication

- passwordless email magic links,
- signed expiring tokens,
- secure HTTP-only session cookies,
- no confidential authorization based only on localStorage.

## Mapping / Places

Use a production-grade geocoding and routing provider or a properly hosted open-source stack.

Do not rely on public community demo endpoints as guaranteed production infrastructure.

## Calendar

Use authenticated synchronization with the authoritative PA LINE calendar or a dedicated internal booking calendar.

## Documents

Store immutable document versions in durable object storage.

## Email

Transactional email provider for:

- magic links,
- booking request confirmation,
- document copies,
- PA LINE admin notifications,
- status updates.

## Payments

No production payment behavior is currently finalized.

Do not add a payment gateway until deposit, balance, cancellation, fee, and refund policies are defined.

---

# 39. Security requirements

## 39.1 Never trust front-end totals

Pricing must be recalculated server-side before submission.

## 39.2 Never trust front-end availability

Availability and same-day validation must be recalculated server-side before a request is accepted or hold is placed.

## 39.3 Protect confidential rates

Require authorization for:

- prior negotiated prices,
- private contracts,
- venue history,
- confidential quote details,
- internal notes.

## 39.4 Validate all inputs server-side

Especially:

- dates,
- times,
- email,
- phone,
- venue IDs,
- organization access,
- numeric quantities,
- pricing,
- discounts,
- legal state transitions.

## 39.5 Rate limit

Protect:

- magic-link requests,
- place search proxies,
- demand submission,
- booking submission,
- login callbacks.

## 39.6 Audit critical actions

Audit:

- quote generated,
- quote changed,
- discount approved,
- confidentiality accepted,
- document reviewed,
- signature submitted,
- booking submitted,
- hold placed,
- booking approved,
- booking cancelled.

---

# 40. Privacy requirements

Collect only information necessary to complete booking and communication.

Do not publicly expose:

- private-booking names,
- private event details,
- negotiated prices,
- personal contact details,
- internal production notes.

Provide reasonable retention and deletion policies.

---

# 41. Error handling

Every external integration must have a fallback.

## Maps unavailable

Allow manual address entry and mark routing as pending.

## Calendar unavailable

Do not claim availability is confirmed.

Allow request to be saved as pending calendar verification.

## Email magic link unavailable

Show a retry path and support an admin-assisted recovery workflow.

## Quote service unavailable

Save the booking draft without showing a fabricated number.

## Legal document unavailable

Do not enable its acknowledgment.

---

# 42. Performance and responsiveness

Predictive fields must remain responsive.

Guidelines:

- debounce remote lookups,
- cancel/ignore stale requests,
- cache repeated search results,
- return local/saved matches first,
- limit visible suggestions,
- avoid re-rendering the entire page on each keystroke,
- do not trigger city lookup from ZIP autofill and then trigger ZIP lookup again from city autofill,
- do not write browser focus loops.

---

# 43. Admin dashboard requirements

Not implemented in v41, but production should plan for it.

Minimum useful views:

## Booking inbox

- new requests,
- under review,
- changes requested,
- ready for approval.

## Calendar

- confirmed,
- held,
- limited,
- blocked,
- routing conflicts.

## Routing

- previous/next gig,
- miles,
- drive time,
- travel days,
- route-fit warnings.

## Quotes

- calculated quote,
- manual override,
- reason,
- discount eligibility,
- approved discounts,
- exclusivity,
- TRUE POTENTIAL custom quote.

## Venues

- venue history,
- booking contacts,
- prior technical notes,
- number of gigs this year,
- repeat status.

## Demand map

- city demand,
- score,
- local contacts,
- routing opportunities.

## Documents

- current legal versions,
- acceptance audit,
- signer,
- timestamps.

---

# 44. Testing strategy

## 44.1 Unit tests

Test pure functions/rules for:

- seasonal multiplier,
- day-of-week base pricing,
- sound fee,
- sound-tech fee,
- travel-day count,
- repeat eligibility,
- recurring date generation,
- same-day windows,
- start-time limits,
- demand scoring,
- merch totals,
- discount eligibility flags.

## 44.2 Property/edge tests

Test:

- performance crossing midnight,
- existing event crossing midnight,
- exactly 10:00 AM,
- exactly 11:00 PM,
- one minute outside start-time boundaries,
- adjacent shows with insufficient travel,
- event duration changes,
- month-end recurring dates,
- leap years,
- >12-month dates,
- exactly 24-month boundary,
- duplicate recurring dates,
- Limited dates in recurring series.

## 44.3 Integration tests

Test:

- authenticated account can access only authorized venues,
- quote cannot unlock before confidentiality acceptance,
- legal checkbox cannot enable before reached-end event,
- final submit recalculates server-side price,
- booking cannot submit when availability changed,
- stale quote is rejected or recalculated.

## 44.4 End-to-end flows

### Exact date

Landing -> exact calendar -> details -> secure access -> confidentiality -> quote -> exclusivity -> technical -> merch -> contact -> final legal review -> final price -> submit.

### Flexible

Landing -> date window/season -> recommendations -> details -> remaining flow.

### Returning venue

BACK FOR MORE -> magic link -> venue portal -> exact/flexible/series -> remaining flow.

### Demand

GET OVER HERE -> city/venue/contact/momentum -> document checkpoint as applicable -> demand created.

---

# 45. Required acceptance tests

A production build is not ready until all of the following are true.

1. Available date can be selected.
2. Held date cannot be selected as Available.
3. Limited date opens a same-day explanation.
4. Limited date with no possible preliminary window disables request action.
5. Same-day scheduling includes 2 hours before and 2 hours after each show.
6. Travel is included between same-day engagements.
7. Start before 10:00 AM fails.
8. Start after 11:00 PM fails.
9. Exact-date route suggestion never silently replaces the original date.
10. Flexible search can rank Limited dates lower without automatically excluding them.
11. Event cannot continue without a format.
12. Event cannot continue without start and end time.
13. Event cannot continue until sound status is known.
14. TRUE POTENTIAL does not create a fake fixed price.
15. 4+ qualifying gigs marks repeat eligibility.
16. Discount eligibility does not automatically invent a discount amount.
17. Returning booker uses verified authorization, not venue-name text.
18. Private price cannot be viewed before account verification and confidentiality acceptance.
19. Confidentiality acceptance controls remain disabled before document scroll completion.
20. Final legal-document checkboxes remain disabled before document scroll completion.
21. Legal documents appear once in the final booking flow.
22. Final price appears immediately before submission.
23. Final standard-price submit button repeats the total.
24. Merch total is included in final request total.
25. Manual text entry is never overwritten by stale predictive results.
26. Enter alone does not automatically pick the first suggestion.
27. ZIP autofill does not recursively trigger an endless city/ZIP loop.
28. Selecting a venue can populate known location fields.
29. Selecting an event can populate known event fields.
30. Selecting a saved contact can populate known contact/organization fields.
31. Recurring dates reject duplicates and blocked dates.
32. Every recurring date is priced individually before a final production multi-date total.
33. Server recalculates price and availability before accepting submission.
34. No other venue's confidential pricing is exposed.
35. A submission is clearly labeled a request until PA LINE approval.

---

# 46. Known prototype-only behavior that must be replaced

The following are deliberate prototype shortcuts.

## Static calendar snapshot

Replace with live authenticated calendar data.

## Demo holds/bookings/blocked dates

Replace with actual booking/hold records.

## Pseudo mileage

The function creates deterministic fake distances.

Replace with real mapping.

## Fixed 55 mph

Replace with route duration from mapping provider.

## Browser localStorage smart memory

Replace confidential/saved history with authenticated database records.

## Simulated magic link

Replace with real email verification.

## No server-side authorization

Add real access control.

## No payment processing

Do not assume money has been charged.

## No secure document audit trail

Add versioned acceptance records.

## Public geocoder demo endpoints

Replace or proxy through a production service.

---

# 47. Open decisions that another AI must not invent

These items are intentionally unresolved.

1. Actual percentage/dollar amount for introductory discount.
2. Actual referral discount.
3. Actual repeat-booking discount.
4. Discount stacking.
5. Maximum discount.
6. Venue Appreciation Credit economics.
7. Whether short local bookings receive a full travel-day allowance.
8. Final cancellation/liquidated-damages values where blanks remain.
9. Payment/deposit schedule.
10. Payment processor.
11. Refund logic.
12. Final production mapping provider.
13. Final calendar integration architecture.
14. Exact exclusivity pricing policy.
15. TRUE POTENTIAL final pricing workflow.
16. Merch inventory/fulfillment integration.
17. Whether fan demand requires the same legal-document path as commercial booking in production.
18. Notification cadence.
19. Admin approval permissions.
20. Final attorney-approved confidentiality and contract language.

If a build requires one of these values, implement it as configuration or an explicit placeholder and flag it for PA LINE approval.

---

# 48. Do-not-regress checklist

Another AI should preserve these decisions unless explicitly instructed otherwise.

- Three primary landing choices remain visually prominent.
- Returning-booker CTA remains a separate full-width path.
- Booked dates remain Limited when a safe second show may exist.
- 2-hour pre-show allowance remains.
- 2-hour post-show allowance remains.
- Travel remains outside those reserved show windows.
- 10:00 AM earliest start remains.
- 11:00 PM latest start remains.
- Exact date stays selected unless user chooses an alternate.
- Account verification precedes private pricing.
- Confidential pricing agreement precedes quote.
- Contract/riders are not duplicated.
- Legal checkboxes stay disabled until document reaches bottom.
- Final price is shown immediately before submit.
- TRUE POTENTIAL stays custom quote.
- PA LINE spelling remains all caps.
- Predictive/autofill never overrides active manual typing.
- Merch is optional and separate from performance fee.
- Repeat eligibility begins at 4+ qualifying gigs per year.
- Venue Appreciation Credit remains pinned, not silently invented.

---

# 49. Version-history decisions that matter

This is not a full source-control history. It records product decisions that became important.

## v17

Landing first-page three-panel layout approved as the visual baseline.

## v19-v20

Actual PA LINE rose artwork integrated and color-identified by landing path.

## v21-v23

Date fields evolved toward whole-field calendar interaction.

## v24

Booked dates became Limited rather than always unavailable.

## v27

Final buffer rule established:

2 hours before + performance + 2 hours after + travel.

## v29

Major scheduling and interaction audit.

Limited-date safeguards, time validation, rose optimization, and duplicate JS cleanup.

## v32

Custom in-app date picker replaced unreliable browser-native behavior.

## v33

Returning-booker path, secure account gate, confidentiality agreement, and preferred-pricing eligibility introduced.

## v34

City/ZIP/address predictive location logic introduced.

## v35-v36

Booking-only merch bundles and stronger prepurchase incentives introduced.

## v37

Venue, event, and booking-contact predictive memory introduced.

## v38

Authoritative price moved to final stage immediately before request confirmation.

## v39

Duplicate contract/rider/signature pages consolidated into one final Review & Sign page.

## v40

Legal acknowledgments locked until each document is opened and scrolled to the bottom.

## v41

Predictive text/autofill interaction system consolidated to reduce glitchy, recursive, stale, or unresponsive behavior.

---

# 50. Current page map

The current prototype contains the following page sections:


## `pageStart` - Let’s make a show happen.

No standard `.field` controls on this section.

## `pageReturningAccess` - Good to see you again.

Fields:
- `returningEmail`: Email used for previous PA LINE bookings [input / email]
- `returningVenue`: Venue / organization [input]

## `pageReturningHub` - Let’s do it again.

Fields:
- `returnProfileVenue`: Venue / organization [input]
- `returnProfileAddress`: Street address [input]
- `returnProfileCity`: City [input]
- `returnProfileState`: State [input]
- `returnProfileZip`: ZIP [input]
- `returnPriorCount`: PA LINE gigs already confirmed through this venue / booking contact this year [select]

## `pageExact` - What date are you thinking?

No standard `.field` controls on this section.

## `pageFlexible` - When are you thinking?

Fields:
- `rangeStart`: Earliest date [input / date]
- `rangeEnd`: Latest date [input / date]
- `seasonSelect`: Season [select]
- `seasonYear`: Year [select]
- `flexVenue`: Venue / organization [input]
- `flexCity`: City [input]
- `flexState`: State [input]
- `flexZip`: ZIP [input]
- `flexLevel`: Flexibility [select]

## `pageDemand` - Bring PA LINE To You

Fields:
- `demandCity`: City [input]
- `demandState`: State [input]
- `demandZip`: ZIP [input]
- `demandVenue`: Preferred venue [input]
- `demandVenue2`: Alternate venue idea [input]
- `demandParty`: How many people would likely come with you? [select]
- `demandNotes`: Anything useful we should know? [textarea]
- `demandName`: Your name [input]
- `demandEmail`: Email [input / email]
- `demandPhone`: Phone [input]
- `demandUpdates`: Preferred updates [select]

## `pageDemandDone` - You helped put PA LINE on the map here.

No standard `.field` controls on this section.

## `pageDetails` - Tell us about the show

Fields:
- `eventDate`: Selected date [input]
- `eventVenue`: Venue name [input]
- `eventName`: Event name [input]
- `eventAddress`: Street address [input]
- `eventCity`: City [input]
- `eventState`: State [input]
- `eventZip`: ZIP [input]
- `eventType`: Event type [select]
- `eventSetting`: Setting [select]
- `eventStart`: Start time [input / time]
- `eventEnd`: End time [input / time]
- `eventAttendance`: Estimated attendance [input / number]
- `performanceLength`: Performance length [select]
- `timingNotes`: Timing notes [input]
- `houseEngineer`: Qualified house engineer included? [select]
- `soundTechNeeded`: Dedicated PA LINE sound tech needed? [select]
- `soundTechMiles`: Estimated sound tech mileage [input / number]
- `soundNotes`: Sound system notes [input]
- `tpBudget`: Production budget range [select]
- `tpNotes`: Creative notes [input]
- `recurringType`: Booking type [select]
- `recurringFrequency`: How should dates be added? [select]
- `additionalDateInput`: Additional date [input / date]
- `recurringCount`: Number of additional bookings [input / number]
- `introVenueStatus`: Is this a brand-new PA LINE venue? [select]
- `referralSource`: Were you referred by another venue / booking contact? [input]

## `pageReview` - Here’s what we have so far

No standard `.field` controls on this section.

## `pageSecureAccess` - Save the booking before we show private pricing.

Fields:
- `secureAccountName`: Your name [input]
- `secureAccountEmail`: Business email [input / email]
- `secureAccountOrg`: Venue / organization [input]

## `pageConfidentiality` - Confidential Pricing & Booking Terms Agreement

Fields:
- `pricingConfName`: Authorized signer [input]
- `pricingConfTitle`: Title / role [input]

## `pageQuote` - Preliminary quote

No standard `.field` controls on this section.

## `pageExclusive` - Any exclusivity requirements?

Fields:
- `exRadius`: Radius [select]
- `exBefore`: Days before [select]
- `exAfter`: Days after [select]
- `exApplies`: Applies to [select]
- `exExceptions`: Exceptions [select]

## `pageTech` - Technical Requirements

Fields:
- `techIssue`: What needs discussion? [textarea]

## `pageBonus` - Want to show up in PA LINE colors?

Fields:
- `dreamTeamQty`: How many people are on the dream team? [input / number]
- `merchSizes`: Shirt sizes [input]
- `merchFor`: Who is the gear for? [select]

## `pageCheckout` - Almost there.

Fields:
- `buyerName`: Your name [input]
- `buyerEmail`: Email [input / email]
- `buyerPhone`: Phone [input]
- `buyerOrg`: Organization / venue [input]
- `buyerPref`: Best way to reach you [select]
- `buyerNotes`: Anything else? [input]

## `pageDocumentGate` - Review & Sign

Fields:
- `sName`: Full legal name [input]
- `sTitle`: Title / role [input]
- `sSig`: Signature [input]
- `sDate`: Date [input / date]

## `pageDone` - You’re on the calendar radar.

No standard `.field` controls on this section.


---

# 51. Important current JavaScript modules/functions

The prototype is one file, so these are functions rather than separate modules. A production build should group them into domain modules.

## Navigation / state

- `showPage`
- `state`

## Calendar / availability

- `availability`
- `renderCalendar`
- `bookedEventsForDate`
- `liveCalendarEventsFor`
- `showLimitedDateModal`
- `sameDayWindows`
- `sameDayTimingStatus`
- `renderSameDayAvailability`
- `renderUniversalShowWindow`

## Routing

- `routeFor`
- `pseudoLegMiles`
- `travelMinutesBetween`
- `surroundingConfirmedShows`

## Flexible-date recommendation

- `flexWindow`
- `findFlexibleDates`

## Event details

- `openDetails`
- `updateDetails`
- `chooseFormat`
- `renderExactSuggestions`

## Pricing

- `seasonal`
- `rawBase`
- `soundFee`
- `techCost`
- `openQuote`
- `finalBookingAmounts`
- `renderFinalPriceConfirmation`

## Exclusivity

- `setExclusive`
- `calcExclusive`

## Recurring

- `toggleRecurring`
- `validateAdditionalDate`
- `generateRecurringDates`
- `renderAdditionalDates`

## Returning accounts

- `openReturningAccess`
- `completeReturningVerification`
- `captureReturningProfile`
- `startReturningExact`
- `startReturningFlexible`
- `startReturningSeries`

## Security / confidentiality

- `continueToSecurePricing`
- `completeSecureVerification`
- `openConfidentiality`
- `updateConfidentialityGate`
- `acceptConfidentialityAndQuote`

## Legal review

- `openDocumentReview`
- `trackDocumentReviewScroll`
- `completeDocumentReview`
- `syncDocumentReviewLock`
- `prepareSharedDocumentGate`
- `updateSharedGate`

## Demand

- `setDemandRole`
- `updateDemandState`
- `submitDemand`

## Merch

- `selectMerchPackage`
- `updateMerchPackage`
- `renderMerchSelection`
- `merchSummaryHTML`

## Location predictive

- `setupCityPredictive`
- `setupZipLink`
- `setupAddressPredictive`
- `setLocationFields`

## Venue/event/contact predictive

- `setupSmartBookingAutofill`
- `setupSmartAutocompleteInput`
- `fillVenueSelection`
- `fillEventSelection`
- `fillContactSelection`
- `rememberVenue`
- `rememberEvent`
- `rememberContact`

## v41 responsive input helpers

- `paProgrammaticEvent`
- `paNotifyValue`
- `paSuggestionSuppressed`
- `paSuppressSuggestionsBriefly`
- `closeAllSuggestionLists`
- `setupSuggestionKeyboard`

---

# 52. Suggested codebase decomposition

Instead of preserving one 4,000+ line HTML file, production should separate concerns.

```text
/app
  /booking
    /start
    /exact-date
    /flexible-date
    /details
    /secure-access
    /confidentiality
    /quote
    /exclusivity
    /technical
    /merch
    /review
    /complete
  /returning
  /demand
  /admin

/components
  Calendar
  DatePicker
  AvailabilityBadge
  SameDayWindow
  VenueAutocomplete
  EventAutocomplete
  ContactAutocomplete
  AddressAutocomplete
  QuoteBreakdown
  LegalReviewModal
  SignatureForm
  MerchBundleCard

/domain
  availability
  routing
  pricing
  discounts
  recurrence
  demand
  legal
  merch

/server
  auth
  booking
  venues
  calendar
  routing
  pricing
  documents
  notifications

/config
  pricing-rules
  discount-rules
  merch-rules
  scheduling-rules
```

Critical business rules should live in `/domain` and be unit-tested independently of UI components.

---

# 53. Configuration-first rule design

Do not scatter business constants through components.

Example:

```ts
export const bookingRules = {
  scheduling: {
    earliestPerformanceStart: "10:00",
    latestPerformanceStart: "23:00",
    preShowMinutes: 120,
    postShowMinutes: 120,
    maxMonthsOut: 24,
    longRangeMonths: 12
  },
  travel: {
    mileageRate: 0.80,
    maxDriveHoursPerTravelDay: 8,
    hourlyDriveRate: 0
  },
  sound: {
    solo: 25,
    duo: 50,
    fullBand: 250,
    soundTechBase: 150,
    soundTechMileageRate: 0.80
  },
  repeat: {
    qualifyingShowsPerYear: 4
  },
  merch: {
    retailShirt: 25,
    repPackage: 40,
    crewPackage: 75,
    dreamUnit: 20,
    dreamMinimum: 6,
    dreamFreeBookerShirtAt: 10
  }
}
```

Pricing-rule versions should be recorded with quotes so historical bookings remain explainable if rates change later.

---

# 54. Production build sequence for another AI

Recommended implementation order:

## Phase 1 - Domain rules

Build and test:

- dates,
- availability statuses,
- scheduling windows,
- pricing,
- recurring dates,
- discount eligibility,
- merch calculations.

No UI until these pass tests.

## Phase 2 - Database and authenticated identity

Build:

- users,
- organizations,
- venues,
- roles,
- booking drafts,
- booking dates,
- legal document versions.

## Phase 3 - Calendar and route integrations

Build:

- authoritative availability,
- previous/next-gig resolution,
- real routing,
- same-day validation.

## Phase 4 - Booking UI

Recreate the approved progressive flow and visual system.

## Phase 5 - Secure pricing and legal

Add:

- magic link,
- confidentiality gate,
- versioned legal review,
- scroll-to-unlock audit,
- signature.

## Phase 6 - Admin operations

Add:

- booking inbox,
- holds,
- manual pricing review,
- approval,
- document management.

## Phase 7 - Merch, discounts, demand tooling

Add:

- merch fulfillment,
- configurable discounts,
- demand market intelligence.

## Phase 8 - Payments

Only after financial policy is defined.

---

# 55. Instructions to a software-building AI

When using this specification:

1. Treat the current stable prototype as a behavioral reference, not production architecture.
2. Do not delete business rules because they seem unusual.
3. Do not "simplify" the 2-hour before and 2-hour after buffers.
4. Do not convert Limited booked dates into blanket Unavailable dates.
5. Do not expose private prices before authentication/confidentiality.
6. Do not duplicate legal-review pages.
7. Do not enable legal acknowledgment before document review is complete.
8. Do not put the authoritative final price earlier than the final submission stage.
9. Do not invent unresolved discount/credit/payment rules.
10. Put sensitive validation and pricing on the server.
11. Preserve the three-path landing experience and separate returning-booker path.
12. Preserve manual-input control over predictive systems.
13. Ask for a product decision when this specification marks a rule as unresolved.
14. Build reusable domain services instead of reproducing a single giant HTML script.
15. Keep enough auditability that PA LINE can explain how any quote, booking decision, or legal acceptance was produced.

---

# 56. Handoff definition of done

Another engineering AI/team has successfully implemented this product when:

- it can reproduce all four entry paths,
- it uses real authenticated accounts,
- it uses real calendar data,
- it uses real routing,
- same-day scheduling is safe under the defined buffers,
- every date in a series is independently priced,
- private pricing is gated,
- legal acceptance is versioned and auditable,
- final totals are server-calculated,
- predictive fields are helpful but never intrusive,
- repeat eligibility is tracked,
- unresolved discount/credit rules remain configurable,
- PA LINE staff can review and approve requests,
- a submitted request cannot accidentally become confirmed without approval,
- the user experience still feels like the approved PA LINE booking product rather than a generic CRM form.

---

# 57. Source integrity

This documentation was generated against the current stable prototype and current supporting source files in the handoff package.

When a source file is intentionally changed, update:

- this specification,
- the machine-readable manifest,
- the source checksum list,
- the document version references,
- affected automated tests.


## Source file checksums

- `PA_LINE_Booking_Prototype_STABLE_v41.html`: `f3cb0002c73121209cdb5daf3b68299f8f15e7eb6cd0651c0c664dc7f9d4099f`
- `PA_LINE_Performance_Agreement_2026_Fillable.docx`: `4104e36f5e5dd4ebf4180582e3e987b3fa040dfc4a1ef30fe4c02e123286a6c7`
- `PA_LINE_2026_Stage_Plot.html`: `9b770ca5d3c3957f1398dd100004312b4282c9d0772f661428f92bacba710df2`
- `PA_LINE_2026_Technical_Rider.html`: `2adff355859eb7372afd5deeb78e077e29c8ee21c7faf287b1ad7c344e8067f6`
- `PA_LINE_2026_Personal_Hospitality_Rider.html`: `c747362340d4db20272a3002664ab59250931f6fafdb006239512e56cd34be7d`
- `PA LINE Rose Invert.png`: `c8e9928aaa9ffe4bb48b6205dc6d3f4068f5712553dd9344659162b52e99c086`


**End of full build specification.**
