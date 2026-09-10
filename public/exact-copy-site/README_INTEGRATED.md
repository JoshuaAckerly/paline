# PA LINE Integrated Platform Prototype v1

This prototype connects the two existing applications without collapsing their interfaces.

## Flow

1. Public user uses `booking/index.html`
2. Booking request is written to the shared prototype bridge
3. `crew/index.html` imports new public requests into COMMAND as incoming offers
4. Required lineup members respond through the existing CREW offer workflow
5. Trever/COMMAND approves and confirms using the existing confirmation rules
6. Confirmed offer becomes a Show Hub record

## Prototype limitation

The bridge uses browser `localStorage` plus `BroadcastChannel`. That means it is suitable only for local/hosted prototype testing in the same browser profile.

Production must replace this bridge with a real backend/database and authenticated APIs.

## Production bridge recommendation

Public booking:
POST /booking-requests

Server:
- validate request
- recalculate pricing
- recalculate availability
- persist booking request
- create COMMAND offer
- notify Trever and required members

COMMAND:
- reads offers from shared database
- members submit responses through authenticated self-only accounts
- Trever confirms
- server creates show record transactionally

## Security

Do not expose member-private calendar details, private notes, or residential routing origins to the public booking application.


## v2: private gig timeline

COMMAND offers and confirmed Show Hubs include a Trever-only chronological communication log: outreach, replies, calls, texts, email, follow-ups, confirmation, changes, payment notes, who was contacted, what was said, and optional next follow-up time.


## v3: booking email logging

Booking emails now use the same private Trever gig timeline. COMMAND can add inbound/outbound email entries with contact, address, subject, body, timestamp, follow-up date, and optional Gmail thread ID. Production Gmail integration should automate this for explicitly linked booking threads.
