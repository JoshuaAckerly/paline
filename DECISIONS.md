# PA LINE Architecture Decisions

## D-001 - Development and release commands
Status: Accepted

- `go team` means development-only work.
- `full send go team` is the only phrase that authorizes production handoff or deployment.
- Development work must not be merged to `main` without full-send authorization.

## D-002 - One canonical backend
Status: Accepted

Laravel is the canonical backend for PA LINE.

The repository must not maintain a second independent Crew/Command backend as the long-term architecture. The previous Node-server contract is considered an incomplete migration layer.

Reason:
- Laravel already contains database-backed users, booking requests, venues, contacts, engagements, authentication, routing services, and tests.
- The current port-5174 Crew dev server serves static files only.
- Exact-copy frontend clients currently call API routes that do not exist.
- A second backend would duplicate authentication, persistence, permissions, deployment, and business rules.

## D-003 - One canonical record per business concept
Status: Accepted

Booking, Crew, Command, and Street Team are experiences over shared records, not separate copies of the same data.

A show, venue, contact, person, booking, payment, or communication record should have one canonical identity.

## D-004 - Preserve behavior, retire prototype infrastructure
Status: Accepted

Useful booking and operations behavior may be migrated from exact-copy beta files. Browser localStorage, BroadcastChannel bridging, simulated authentication, and phantom server routes are not authoritative architecture.

## D-005 - Roles and permissions
Status: Accepted

Users may have multiple roles. Role permissions combine additively. Per-user overrides support Default, Allow, and Deny. Explicit Deny wins.

Permission checks must be enforced by the backend.

## D-006 - Temporary access
Status: Accepted

Requestable restricted access may be granted temporarily and scoped to a specific resource. Grants require an audit trail and automatic expiration. Highest-admin functions, role/permission management, account deletion, system settings, and sensitive bank information are never self-requestable.

## D-007 - Navigation
Status: Accepted

Primary categories are Home, Shows, Booking, People, Money, Communication, Promotion, and Command.

Access is attached to subcategories/actions, not merely the top-level category.

## D-008 - Current P0 root cause
Status: Confirmed

The exact-copy beta loads server clients that call APIs including `/api/auth/*`, `/api/state*`, `/api/system/readiness`, and `/api/vault`. Those APIs are not implemented in the current Laravel route set, while the Crew port-5174 server is static-only. This mismatch explains the observed 404 failures.
