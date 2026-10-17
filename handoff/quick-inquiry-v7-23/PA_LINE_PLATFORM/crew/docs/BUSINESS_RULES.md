# PA LINE CREW + COMMAND Business Rules

These rules are requirements, not suggestions for code cleanup.

## Portals

- Every band member has their own private portal and identity.
- Members cannot edit another member's availability, responses, private notes, or calendar settings.
- COMMAND administrators can view aggregate operational availability but should not see personal calendar event details by default.

## Availability

- Availability is calculated per lineup, not per band as one global yes/no.
- A conflict only blocks lineups that require the unavailable member.
- Full PA LINE, Duo, and Solo must remain independently configurable.
- A personal busy period must never reveal the personal event title to other members, venues, or the public booking app.
- If a connected calendar is stale or sync fails, do not assume the member is available. Return a CHECK / UNKNOWN state.
- Manual member blocks can cover a whole day or a time range.
- Confirmed PA LINE commitments outrank new offers.
- COMMAND retains final authority to confirm a show.

## Offers

- Members respond AVAILABLE, UNAVAILABLE, or NEED TO TALK.
- A member response does not itself confirm or reject a show.
- A show can only be confirmed when the required lineup is operationally available and required member responses are available.
- Notes may be shared with assigned crew or private to the author.

## Calendar privacy

- Production calendar integrations should request the minimum scope needed for free/busy availability.
- Do not persist personal event title, attendee list, description, or location unless the member explicitly chooses to share it.
- The master calendar may show `Member busy` but not the reason.

## Songbook

- Admin controls which songs are marked Performable.
- Members may see Performable and Learning material but may not publish songs.
- Arrangement versions are preserved. Significant changes create a new arrangement version rather than silently replacing history.
- Admin notes are band-level.
- Role notes target musical roles.
- Member notes are private to that member.
- Member learning state belongs to the pair `(member, song)`.
- Practice audio belongs to a song and may include reference tracks and stems.
- Production audio must be access-controlled and must not be public by default.

## Public booking app boundary

- Do not merge the public booking frontend into this project yet.
- The public app should eventually consume a server-side availability result such as Full PA LINE / Duo / Solo availability without receiving private member conflict details.


## Per-event personal calendar override

- Synced/imported personal calendar busy events may be individually overridden by their owner.
- Clicking `I'M STILL AVAILABLE` changes that busy event to an availability override for PA LINE only.
- The original personal calendar event is not deleted, edited, or moved.
- Ignored personal events appear dimmed in the member portal and do not count as availability conflicts.
- The member can toggle the event back to blocking at any time.
- COMMAND may see that a busy window has an availability override, but still must not receive the private event title/description/location by default.
- Public booking clients must never receive personal event details or override history.


## Rehearsals

- COMMAND can schedule rehearsals for selected members.
- Rehearsals have date, start/end time, location, notes, invitees, status, and RSVP state.
- Admin chooses whether a rehearsal blocks booking availability.
- If blocking is enabled, invited members are treated as committed during that time by the availability engine.
- RSVP does not silently change booking availability. COMMAND controls the event roster and blocking status.

## Band meetings

- COMMAND can schedule video band meetings for selected members.
- Meetings have date, start/end time, agenda, invitees, RSVP state, and an optional HTTPS meeting URL.
- Admin chooses whether a meeting blocks booking availability.
- Video meeting links are visible only to authenticated invited members/admin in production.

## Crew chat

- Casual chat is separate from formal show notes, offer responses, legal records, and arrangement instructions.
- Every message has an author, channel, timestamp, and body.
- Production chat should be authenticated and realtime.
- Chat messages should not automatically become booking or contract records.


## Weekly Ops and workload

- The default weekly operating workload uses 100 points.
- Trever owns 40 points. Griffin, Andrew, and Michael each own 20 points.
- Points represent relative workload, not pay, ownership, authority, or musical importance.
- Members may complete and annotate their own tasks. COMMAND may review all tasks.
- Social posting benchmarks are starting routines, not permanent algorithm rules. Native PA LINE analytics should supersede generic timing benchmarks once enough first-party data exists.
- Default social routine: TikTok 3-5 posts/week, Instagram 3-5 feed posts/week plus regular Stories, Facebook roughly one useful post most days.
- Rehearsal target is at least biweekly unless the current show/song/lineup workload calls for more.
- `BMI / PRO` means performing-rights/catalog administration, not a health metric.


## Shared weekly checklist completion

- Every member sees the full Weekly Ops checklist.
- Planned workload allocation remains Trever 40%, Griffin 20%, Andrew 20%, Michael 20%.
- Actual completion credit belongs to the member who checks the completed box.
- Planned owner and actual completer are separate concepts.
- Repeatable goals may contain sub-checks. Examples: Instagram posts, TikTok posts, Facebook posts, source content pieces.
- A parent task with sub-checks completes automatically only when all required sub-checks are complete.
- Each sub-check stores its own completed_by and completed_at values.
- Any band member may contribute to any shared checklist task unless a future permission explicitly restricts it.


## Offer member cuts

- For an offer with an entered show guarantee/pay amount, each assigned non-owner performing member receives a displayed 20% member cut.
- Trever does not receive a fixed 20% member cut in this system. His compensation is represented as owner draw / owner withdrawals handled separately.
- Only members actually assigned to the offer receive a member-cut calculation.
- Full PA LINE currently means Griffin, Andrew, and Michael each receive 20% of the entered show offer. The remainder stays unallocated to fixed member cuts and may cover business expenses and owner draws.
- Duo or other reduced lineups only calculate 20% for non-owner members assigned to that lineup.
- The prototype does not calculate taxes, reimbursements, business expenses, payroll classification, or legal/accounting treatment.
- Confirmed shows preserve a payout snapshot based on the offer at confirmation time.


## Attendance and merch planning

- Offers may store a provided expected attendance.
- If attendance is not provided, the backend may estimate attendance from first-party show history.
- Estimation priority should favor same venue history, then same market/city, then same lineup, then broader PA LINE history.
- When there is no useful history yet, projections must be clearly labeled low-confidence starter projections.
- Never present projected attendance as an actual headcount.
- Confirmed shows preserve the attendance estimate that existed at confirmation time.
- After a show, COMMAND may record actual attendance and actual gross merch sales.

## Merch split

- Merch revenue uses a separate rule from the show guarantee.
- 50% of gross merch sales is reserved directly for buying/replenishing merch.
- The remaining 50% is the merch profit/distribution pool.
- Assigned non-owner performing members receive their normal 20% percentage from that remaining 50% pool.
- Trever has no fixed merch percentage in the app and remains owner draw.
- Forecasted merch is planning data only. Member cuts and restock accounting should use actual gross merch when available.
- Reduced lineups only calculate merch member cuts for assigned non-owner performers.


## Commitment timeline

- Every offer/show commitment window should display actual calculated clock times.
- Commitment start = inbound travel + fixed 2-hour pre-show window before performance.
- Commitment end = performance end + fixed 2-hour post-show window + outbound travel.
- Inbound and outbound travel hours are explicit offer fields.
- The availability engine must evaluate the full calculated commitment window, not only performance time.
- Overnight commitment windows must preserve the correct next-day date.

## Collaborative setlists

- Offers and confirmed shows may each have a collaborative setlist.
- Any band member may add songs, remove songs, and reorder songs while the setlist is unlocked.
- Reordering supports drag/drop plus accessible move-up/move-down controls.
- The setlist builder shows the full Songbook/discography in an adjacent panel with search.
- Discography entries show title, status, key, time signature, and length.
- Total set music duration is calculated from song lengths.
- Only COMMAND/admin may lock or unlock a setlist.
- Once locked, non-admin members may view but not change it.
- A confirmed show snapshots/copies the offer setlist at confirmation.


## Booking email timeline

- Booking-related emails belong in the same private COMMAND gig timeline as calls, texts, outreach, replies, confirmations, and follow-ups.
- Email timeline entries may store direction, sender/contact, subject, important body/snippet, occurred-at time, Gmail thread ID, Gmail message ID, and next follow-up time.
- Duplicate Gmail messages should not create duplicate timeline entries when a message ID is already linked.
- Email timeline entries are COMMAND/admin-only by default.
- Production Gmail integration should link booking threads to contacts/offers/shows and append new thread messages automatically after explicit account authorization.
- Automatic email logging must not import unrelated personal email.
