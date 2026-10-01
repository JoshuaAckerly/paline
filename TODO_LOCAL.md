# PA LINE Development TODO

Statuses: Backlog | In Progress | Testing | Ready for Full Send | Parked

## P0 Stability

### In Progress
- [ ] Consolidate the backend around Laravel.
- [ ] Replace or adapt missing exact-copy API contracts currently returning 404.
- [ ] Establish authoritative database persistence for Crew/Command state.
- [ ] Replace simulated portal authentication with Laravel-backed authentication.
- [ ] Verify frontend/backend version and route contracts.
- [ ] Eliminate reliance on the phantom Node API server at port 5174.

### Known broken API contracts
- [ ] /api/vault
- [ ] /api/auth/me
- [ ] /api/auth/login
- [ ] /api/auth/setup
- [ ] /api/state
- [ ] /api/state/patch
- [ ] /api/system/readiness
- [ ] /api/messages
- [ ] /api/public/request

### Testing
- [ ] Prove state survives refresh.
- [ ] Prove state survives browser restart.
- [ ] Prove state survives application restart.
- [ ] Prove development data cannot modify production.
- [ ] Run Laravel tests.
- [ ] Run TypeScript checks.
- [ ] Run frontend tests.
- [ ] Run production build without deploying.

## P0 Core vertical slice

### Backlog
- [ ] Public booking creates one canonical booking/opportunity record.
- [ ] Booking can become an offer/hold without duplicate records.
- [ ] Required lineup members receive/respond to the offer.
- [ ] Authorized admin confirms or declines.
- [ ] Confirmation creates/updates one canonical Show record.
- [ ] Confirmed show opens one canonical Show Hub.
- [ ] Preserve communication and status history throughout.

## P1 Accounts and Permissions

### Backlog
- [ ] Account types: Band/Crew, Staff/Management, Street Team.
- [ ] Membership statuses: Core Member, Extended Roster.
- [ ] Multiple overlapping roles per user.
- [ ] Checkbox-based role permission editor.
- [ ] Per-user Default / Allow / Deny overrides.
- [ ] Protected highest-admin account.
- [ ] Granular finance permissions.
- [ ] Granular venue/contact permissions.
- [ ] View As User.
- [ ] Temporary access requests with scope and expiration.
- [ ] Self-service profile/account setup after invitation.
- [ ] Optional Street Team public signup into limited role.
- [ ] Server-side authorization for protected actions.

## P2 Navigation Cleanup

### Backlog
- [ ] Home
- [ ] Shows
- [ ] Booking
- [ ] People
- [ ] Money
- [ ] Communication
- [ ] Promotion
- [ ] Command
- [ ] Permission-aware subcategories.
- [ ] All Areas / More Tools for requestable locked areas.
- [ ] Remove visual overload and duplicate navigation concepts.

## P3 Existing Feature Cleanup

### Backlog
Audit every current feature as Keep / Fix / Simplify / Combine / Move / Remove / Park.

Priority areas:
- [ ] Booking beta
- [ ] Crew dashboard
- [ ] Command dashboard
- [ ] Offers
- [ ] Shows and Show Hub
- [ ] Availability and calendars
- [ ] Songbook
- [ ] Setlists
- [ ] Chat and communications
- [ ] Weekly Ops
- [ ] Routing and lodging
- [ ] Money / payouts / merch
- [ ] Contacts / outreach
- [ ] Analytics / market tools
- [ ] Street Team / fan demand
- [ ] Legacy prototype administration

## P4 New Features

### Parked
Do not expand major features until P0-P2 are stable.
