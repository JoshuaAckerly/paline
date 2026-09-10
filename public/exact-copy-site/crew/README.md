# PA LINE CREW + COMMAND v1

This is the private backend companion prototype for PA LINE.

It is intentionally separate from the public booking app. The internal system should become reliable first, then the public booking app can call the same backend later.

## Run it

You only need Node.js.

```bash
npm run validate
npm run dev
```

Then open:

```text
http://localhost:5174
```

No `npm install` is required for this prototype.

## What works now

### Individual member portals
Each member has their own simulated portal with:

- private dashboard
- manual full-day or partial-day availability blocks
- show offers
- `I'M AVAILABLE`, `I CAN'T DO IT`, and `NEED TO TALK`
- confirmed shows assigned to that member
- private and shared notes
- notifications
- personal calendar settings
- Songbook learning state
- private song notes
- arrangement acknowledgement

### PA LINE COMMAND
The admin portal can:

- see the master calendar
- create show offers
- see member calendar conflicts
- see crew responses
- confirm a show only when required members are available and have answered available
- inspect each member portal
- edit lineup membership for Full PA LINE, Duo, and Solo
- manage the Songbook
- manage performable vs learning songs
- upload practice reference audio and stems
- review activity history

### Availability engine
Availability is lineup-specific.

Example:

```text
Full PA LINE = Trever + Griffin + Andrew + Michael
Duo         = Trever + Andrew
Solo        = Trever
```

If Michael blocks a date:

```text
Full PA LINE = unavailable
Duo         = still potentially available
Solo        = still potentially available
```

The lineup rules are editable in COMMAND rather than hard-coded into the public booking interface.

### Calendar privacy
The prototype supports:

- manual personal blocks
- simulated Google calendar connection
- simulated Microsoft calendar connection
- `.ics` busy-window import
- ignored / enabled calendar sources
- stale-calendar safety state

The design rule is that PA LINE needs the busy window, not the personal event title, description, or location.

### Songbook
Admin can maintain songs with:

- title
- artist / writer
- original or cover
- status: Performable, Learning, Rehearsal Only, Retired, Archived
- key signature
- time signature
- BPM
- length
- tuning
- capo
- count-in
- arrangement notes
- role-specific notes
- arrangement versions
- reference audio
- stems

Members get:

- current performance data
- admin arrangement notes
- their role note
- their private notes
- learning state: Not Started, Learning, Needs Rehearsal, Show Ready
- arrangement acknowledgement
- practice player

The practice player supports:

- play / pause
- seeking
- 10-second skip
- playback speed
- A/B looping
- selecting uploaded reference tracks or stems

Prototype audio files are stored in browser IndexedDB. Production should use authenticated object storage.

## Important prototype limitations

This is not a production backend yet.

The current version uses:

- localStorage for records
- IndexedDB for local audio
- simulated users instead of authentication
- simulated Google/Microsoft connections
- manual `.ics` import
- browser-local notifications

The production target should use Supabase/PostgreSQL, server-side authorization, OAuth calendar integrations, object storage, realtime subscriptions, and push/email notifications.

## Start with these files in VS Code

- `src/app.js`: current prototype logic
- `src/styles.css`: UI
- `docs/BACKEND_SCHEMA.md`: production data model
- `docs/BUSINESS_RULES.md`: rules that must not be broken
- `docs/ROADMAP.md`: recommended build order
- `.github/copilot-instructions.md`: instructions for GitHub Copilot

## Next architecture step

Do not connect the public booking app yet.

First productionize:

1. authentication
2. member profiles
3. PostgreSQL schema
4. row-level security
5. availability engine
6. personal calendar free/busy sync
7. offers and responses
8. master calendar
9. Songbook storage
10. practice audio object storage
11. realtime notifications

Once those are solid, the public booking app can call the same availability engine.


## Personal calendar cleanup behavior

Imported or synced personal events remain visible as privacy-safe busy windows. A member can click `I'M STILL AVAILABLE` on any personal calendar event. That event then dims in their PA LINE calendar and no longer blocks that member for lineup availability. Clicking `MAKE BLOCKING` restores it.

This override changes only PA LINE availability. It does not change the source Google, Microsoft, or iCalendar event.


## Rehearsals, video meetings, and chat

v1.2 adds:

- scheduleable rehearsals
- selected-member rehearsal invitations
- rehearsal RSVP
- optional rehearsal booking block
- scheduled video band meetings
- meeting agenda
- member invitations and RSVP
- HTTPS join link support
- optional meeting booking block
- casual Crew Chat channels
- General, Rehearsal Talk, and Song Ideas starter channels

Rehearsals and meetings appear on the Master Calendar. Their effect on booking availability is explicit and controlled by COMMAND.


## Weekly Ops v1.3

Adds a repeatable 100-point band workload with a 40/20/20/20 assignment split, per-member checklists, notes, completion tracking, workload progress, social growth playbook, booking/tour/website/BMI-PRO/merch/gear/content/rehearsal/admin tasks, and a biweekly rehearsal operating target.


## Weekly Ops v1.4

The checklist is now one shared full-band list. Every box records who actually completed it. Planned 40/20/20/20 ownership is retained separately for workload planning.

Repeatable tasks now have sub-checks, including:
- 5 TikTok posts
- 5 Instagram feed posts
- 7 Facebook posts
- 2 source content pieces

When every sub-check is complete, the parent checkbox completes automatically. The actual-work dashboard tallies credit to the member who checked each individual box.


## v1.6 Attendance + Merch Potential

Offers and confirmed shows can now track attendance and merch potential.

Attendance can be:
- provided by the venue/booker
- estimated from prior PA LINE venue history
- estimated from market/city history
- estimated from lineup history
- shown as a clearly labeled low-confidence starter projection when no history exists

The backend produces a low / target / strong-night merch forecast.

Actual merch uses a separate split:
- 50% restock reserve
- remaining 50% becomes the merch distribution pool
- assigned non-owner members receive 20% each of that remaining pool
- Trever remains owner draw


## v1.7 Commitment Timeline + Collaborative Setlists

Offers now show actual commitment clock times including:
- inbound travel
- 2-hour pre-show commitment
- performance
- 2-hour post-show commitment
- outbound travel

The availability engine uses that complete window.

Offers and confirmed shows now include a collaborative Setlist Builder. Anyone in the band can add/remove/reorder songs while the setlist is unlocked. The builder shows the full Songbook beside the current setlist, supports search, drag-and-drop, move up/down controls, and calculates total music time. Only COMMAND/admin can lock or unlock the final setlist.
