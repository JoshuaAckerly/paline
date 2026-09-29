# GitHub Copilot Instructions for PA LINE CREW + COMMAND

Read `docs/BUSINESS_RULES.md` before changing behavior.

## Project goal

This project is the private PA LINE backend-facing Crew and Command interface. Do not merge it into the public booking frontend unless explicitly instructed.

## Non-negotiable rules

- Every member has an individual portal and identity.
- Availability is lineup-specific.
- Full PA LINE, Duo, and Solo are independent configurations.
- Never expose personal calendar event details to other members or public clients by default.
- A stale or failed personal calendar sync must not become AVAILABLE.
- Member offer responses are AVAILABLE, UNAVAILABLE, and NEED TO TALK.
- A member response is advisory input. COMMAND makes the final confirmation.
- Admin controls which songs are Performable.
- Song arrangements are versioned.
- Member song notes are private.
- Role notes are role-specific.
- Practice audio must be access-controlled in production.

## Current prototype storage

- localStorage contains structured records.
- IndexedDB contains uploaded practice audio.
- These are demo implementations only.

Do not mistake browser persistence for production security.

## Production direction

Prefer:
- Supabase Auth
- PostgreSQL
- Row Level Security
- Supabase Realtime
- Supabase Storage
- server-side availability functions
- Google Calendar FreeBusy
- Microsoft Graph calendar availability

## Refactoring

Refactor incrementally. Preserve working behavior first.

Good module boundaries when ready:
- auth
- availability
- calendars
- offers
- shows
- songbook
- audio
- notifications
- data-access

Do not rewrite everything into a framework in one pass.

## Validation

Run:

```bash
npm run validate
```

before considering a change complete.


## Per-event calendar availability override

- Personal calendar busy events can be individually toggled by their owner to `available`.
- This is a PA LINE-side override only. Never modify or delete the source calendar event.
- An overridden event must be visually dimmed and excluded from conflict calculations.
- Members can restore it to blocking.
- Keep the source event private even after override.


## Rehearsals, meetings, chat

- Rehearsals and meetings are first-class internal calendar entities.
- Each event has an explicit `blocksAvailability` choice. Never infer it from event type.
- RSVP is not the same as availability. Do not automatically alter availability from RSVP.
- Video meeting URLs must be HTTPS and access-controlled in production.
- Crew Chat is informal. Do not treat casual messages as formal booking notes, legal acceptance, or Songbook arrangement instructions.


## Weekly Ops

- Preserve the default 100-point weekly workload split: Trever 40, Griffin 20, Andrew 20, Michael 20.
- Workload points are planning weights only. Do not reinterpret them as compensation or status.
- Social benchmarks are editable starting assumptions and should eventually be driven by first-party analytics.
- BMI / PRO task refers to music performing-rights/catalog administration.


## Weekly checklist completion credit

- All members see the full shared checklist.
- Keep `ownerId` as planned workload ownership.
- Store `doneBy` separately as actual completion credit.
- For repeat goals, store completion on individual subtasks.
- Parent tasks with subtasks are derived and must auto-complete only when all required subtasks are done.
- Do not award a whole repeatable task to one person when multiple members checked different subitems.


## Member cuts

- Assigned non-owner members currently display a 20% cut of the entered show offer/guarantee.
- Trever is the owner and has no fixed member percentage in this app. Represent his compensation as owner draw.
- Never calculate a cut for a member not assigned to that offer.
- Preserve a payout snapshot when an offer becomes a confirmed show.
- Do not silently reinterpret this prototype rule as payroll, tax, or accounting advice.


## Attendance and merch

- Distinguish provided, estimated, projected, and actual attendance.
- Prefer first-party PA LINE history over generic assumptions.
- Never display a projection as an actual.
- Merch forecast is planning data only until actual gross is entered.
- Merch split: reserve 50% of gross for restock first, then apply assigned non-owner 20% member cuts to the remaining 50%.
- Trever remains owner draw and has no fixed percentage.


## Commitment timeline and setlists

- Commitment window = inbound travel + 2-hour pre-show + performance + 2-hour post-show + outbound travel.
- Use actual timestamps and preserve overnight dates.
- Availability must use the full calculated commitment window.
- Setlists are collaborative while unlocked.
- All band members may reorder/add/remove while unlocked.
- Only admin may lock/unlock.
- Locked setlists are read-only to non-admin members.
- Keep drag/drop plus accessible move controls.
- Show the full Songbook/discography beside the active setlist.
