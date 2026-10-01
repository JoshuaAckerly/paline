# PA LINE Platform - Current Source of Truth

## Purpose
This repository is becoming one PA LINE operating system with four experiences that share one backend and one canonical data model:

1. Public Booking - venues, promoters, festivals, and clients.
2. Crew - musicians and show personnel.
3. Command - management and business operations.
4. Street Team - limited promotion and supporter tools.

## Release rule
- `go team` means development work only. Do not modify production.
- `full send go team` is the only authorization to prepare or hand off a tested release for production deployment.
- Production deploys are triggered from `main`. Development work must stay on a non-main branch until full-send approval.

## Canonical backend decision
Laravel is the canonical application backend and persistence layer.

Do not build a second independent Node backend for Crew/Command. The old exact-copy clients may remain temporarily while their behavior is migrated, but their server calls must ultimately terminate in Laravel-backed routes, authorization, and database models.

## Canonical lifecycle
Lead or public request
-> Opportunity / booking request
-> Hold or offer
-> Lineup requirements
-> Member availability and responses
-> Authorized admin decision
-> Confirmed show
-> Show Hub
-> Travel, lodging, setlist, files, communications
-> Performance
-> Settlement and payouts
-> Historical record

A gig should not be recreated in separate subsystems as it advances through this lifecycle.

## Canonical entities
- User / Person
- Role
- Permission
- Venue
- Contact
- Booking Request / Opportunity
- Offer / Hold
- Show
- Show Assignment
- Availability / Response
- Communication
- Finance Transaction
- File / Contract
- Routing / Lodging
- Promotion / Street Team
- Activity / Audit Event

## Current architecture reality
The repository currently contains two overlapping application generations:

### Laravel application
Laravel 13 + React 19 + TypeScript + Inertia. It already owns the public website, database-backed booking requests, venues, contacts, engagements, authentication, admin pages, and booking-domain tests.

### Exact-copy platform
`public/exact-copy-site/` contains the large static Booking and Crew/Command beta interfaces. They still carry prototype-era browser storage and bridge behavior.

The exact-copy frontend loads `shared/server-core.js` and `shared/vault.js`, which call APIs such as:
- `/api/auth/me`
- `/api/auth/login`
- `/api/auth/setup`
- `/api/state`
- `/api/state/patch`
- `/api/system/readiness`
- `/api/vault`
- `/api/messages`

Those API implementations are not present on the current main branch. The crew development server on port 5174 is only a static file server, so those calls return 404.

This is the primary P0 architecture defect.

## Migration rule
Do not blindly rewrite working business behavior. Migrate it behind one canonical Laravel backend in vertical slices.

First vertical slice:
Public Booking -> Booking Request -> Offer / lineup response -> authorized confirmation -> Show Hub.

After that foundation is stable, add the full role and permission model, simplify navigation, and migrate remaining prototype features.

## Access model target
Accounts may have multiple overlapping roles. Roles are permission presets. Effective permissions are additive, with per-user Default / Allow / Deny overrides. Explicit Deny wins.

Account types:
- Band/Crew
- Staff/Management
- Street Team

Membership statuses:
- Core Member
- Extended Roster

Permission areas:
- Shows and Calendar
- Booking and Offers
- Venues and Contacts
- Finance and Payments
- People and Roster
- Show Hub
- Setlists and Files
- Communication
- Routing, Travel, Lodging
- Street Team
- Analytics
- System Administration

Temporary access must support reason, duration, scope, approval, expiration, and audit history.

## Navigation target
- Home
- Shows
- Booking
- People
- Money
- Communication
- Promotion
- Command

Subcategory access is permission-driven. Normal navigation should be calm and show only relevant areas.

## Historical documents
Files that identify themselves as LEGACY REFERENCE ONLY are reference material, not current architecture authority. This document and `DECISIONS.md` take precedence for foundation work.
