# PA LINE Foundation Audit

Date: 2026-10-01
Branch: `dev/foundation-audit-20261001`
Production impact: none

## Executive finding

The current failures are caused by an incomplete backend migration, not by a handful of unrelated broken buttons.

The repository contains a real Laravel backend plus a large exact-copy Booking/Crew beta that still carries prototype-era browser state. In September, frontend client files were added that call a separate Crew/Command API, but the corresponding server was never committed. The current port-5174 Crew development server is only a static file server.

That is why requests such as `/api/auth/me`, `/api/state/patch`, `/api/system/readiness`, and `/api/vault` return 404.

## What exists today

### Laravel application
Stack:
- Laravel 13
- PHP 8.3
- React 19
- TypeScript
- Inertia
- Vite
- SQLite by default

Existing real domain models include:
- User
- Organization
- Venue
- Contact
- BookingRequest
- BookingDate
- BookingHold
- Engagement
- CalendarBlock
- DemandSignal
- LegalDocument

Laravel already has database-backed booking workflows and automated booking tests.

### Exact-copy public Booking
`public/exact-copy-site/booking/index.html`

This is a large, feature-rich booking beta. It still uses the shared browser bridge and newer server client scripts.

### Exact-copy Crew + Command
`public/exact-copy-site/crew/index.html`

This is the current large Crew/Command beta runtime. It contains:
- offers
- shows
- availability
- calendars
- rehearsals
- meetings
- chat
- weekly ops
- songbook
- setlists
- contacts
- communication history
- market/tour tools
- member account UI
- admin controls

It still keeps a large application state object in browser localStorage and mirrors changes through a server client when available.

### Shared bridge
`public/exact-copy-site/shared/bridge.js`

This still treats localStorage plus BroadcastChannel as the immediate bridge between public Booking and Crew/Command, then makes best-effort server submissions.

### Shared server client
`public/exact-copy-site/shared/server-core.js`

This expects server routes for authentication, state persistence, readiness, chat, calendar, payments, maps, contracts, and messaging.

Most of those routes do not exist in Laravel.

### Data Vault client
`public/exact-copy-site/shared/vault.js`

This mirrors PA LINE localStorage keys and audio to `/api/vault*`.

Those routes do not exist in Laravel.

### Crew dev server
`public/exact-copy-site/crew/scripts/dev-server.mjs`

This server only reads static files from disk. It has no API router, authentication, database, state persistence, or chat backend.

Any `/api/*` request made directly to port 5174 therefore becomes a static file lookup and returns 404.

## Confirmed architecture mismatch

The frontend currently expects:
- /api/auth/me
- /api/auth/login
- /api/auth/setup
- /api/auth/logout
- /api/auth/invite
- /api/state
- /api/state/patch
- /api/system/readiness
- /api/contracts/audit
- /api/email/send
- /api/payments/checkout
- /api/maps/route
- /api/calendar/google/start
- /api/messages
- /api/vault
- /api/vault/audio
- /api/vault/export
- /api/public/request

The current Laravel route set does not implement that Crew API contract.

Laravel's own authentication is currently exposed through different routes such as `/auth/me`, and its booking API/domain endpoints use their own route structure.

## Historical source of the problem

Commit `1e12dce03fa1b87b8765fd57add1e9353c98b347` added:
- `shared/server-core.js`
- `shared/vault.js`
- updated exact-copy Booking/Crew betas

The commit introduced the client-side API contract but did not add a corresponding backend server.

Later Laravel code added a `CrewInviteController` that proxies to `http://127.0.0.1:5174/api/auth/*`, further assuming a Crew Node API exists. The process actually running on 5174 is static-only.

## Persistence finding

The current Crew/Command beta primarily saves its large state object in browser localStorage.

Therefore:
- refresh normally preserves browser state
- restarting the static server normally preserves browser state
- clearing site data, changing browsers/devices, or losing the browser profile can lose the working state
- the intended Data Vault server backup does not work while `/api/vault` is missing
- server state mirroring does not work while `/api/state*` is missing

The current browser state must not be treated as the long-term authoritative database.

## Authentication finding

The Crew UI contains account setup and sign-in flows that call the missing server API. It also contains legacy browser-side password migration logic.

This is not a reliable production authentication boundary.

Laravel already has a real User model, password hashing, sessions, and authenticated admin routes. Crew identity should converge on the Laravel identity system rather than creating another standalone identity database.

## Data model finding

The Laravel side already contains strong canonical building blocks:
- BookingRequest can belong to User, Venue, Contact
- BookingRequest has dates, holds, and engagements
- Venue owns contacts and booking history
- Engagement already resembles the beginning of a confirmed Show concept

This is a better foundation than storing the entire operating system as one browser JSON blob.

The migration should extend these models rather than replacing them with another parallel backend.

## UI finding

The exact-copy Crew/Command beta contains a large number of useful features but multiple generations of navigation, account tiers, and prototype controls are layered together.

The planned replacement navigation is:
- Home
- Shows
- Booking
- People
- Money
- Communication
- Promotion
- Command

Access must be controlled at subcategory/action level.

## Security finding

The full Crew data object contains information that should not be readable by every authenticated member.

A server endpoint that simply stores and returns the entire browser state to every Crew user would preserve the current prototype but would not meet the target security model.

Therefore `/api/state` should only be treated as a temporary migration mechanism, not the final domain API.

The target backend must return only records/actions the authenticated user is permitted to access.

## Keep

- Laravel application foundation
- User identity model
- BookingRequest domain logic
- Venue and Contact models
- Engagement/booking relationships
- working public booking business rules
- useful Crew/Command feature behavior
- show availability rules
- communication history concept
- songbook/setlist concepts
- weekly operations concept
- routing/market analytics concepts
- Street Team/fan demand concepts

## Fix

- Crew authentication
- account onboarding
- browser/server persistence
- missing API contracts
- booking-to-offer-to-show transition
- server-side authorization
- account/role model
- Crew/Command navigation
- duplicated show/booking representations
- current dev-server expectations

## Combine

- separate venue representations into Venue
- separate person/member representations into one User/Person identity model
- separate booking/show copies into one lifecycle
- scattered communication logs into one scoped communication system
- scattered financial fields into one finance domain attached to bookings/shows

## Remove or retire after migration

- phantom Node backend assumptions
- browser localStorage as authoritative business storage
- simulated account security
- duplicate prototype routes/screens once canonical replacements exist
- old navigation systems after the new permission-aware navigation is complete
- stale docs that contradict the current source of truth

## Target repair sequence

### P0A - Backend consolidation
Laravel becomes the only canonical backend.

### P0B - Identity
Crew/Command accounts use Laravel-backed identity and secure sessions.

### P0C - Canonical booking/show vertical slice
Public request -> opportunity -> offer/hold -> lineup responses -> authorized confirmation -> Show Hub.

### P0D - Persistence
Move operational records from the browser blob into domain tables/services. Retain a controlled migration/import path for existing browser state.

### P1 - Roles and permissions
Implement overlapping roles, granular permissions, user overrides, View As, temporary access, and audit history.

### P2 - Navigation
Replace layered navigation with Home, Shows, Booking, People, Money, Communication, Promotion, Command.

### P3 - Feature migration
Move remaining useful exact-copy features to canonical domain APIs one area at a time.

## Baseline validation note

A non-deploying GitHub Actions development validation workflow was added to the development branch. GitHub failed the run before assigning a runner, matching the repository's prior Actions infrastructure problem. This failure did not reach project test commands and is not evidence of a code test failure.

## Production safety

No production files, database records, deployment workflow, or `main` branch code were changed during this audit.
