# Backend Roadmap

## Phase 1: Production foundation
1. Create Supabase project
2. Add auth and individual member accounts
3. Implement profiles, roles, and lineups
4. Add row-level security
5. Move manual availability blocks to PostgreSQL
6. Move offers and responses to PostgreSQL
7. Add realtime subscriptions for offers/responses

## Phase 2: Master availability engine
1. Server-side availability function
2. Existing confirmed-show conflicts
3. Manual blocks
4. Calendar busy windows
5. Stale-sync UNKNOWN state
6. Per-lineup evaluation
7. Admin override / discussion state

## Phase 3: Calendar integrations
1. Google Calendar OAuth and FreeBusy API
2. Microsoft Graph calendar availability
3. `.ics` import/subscription fallback
4. Per-calendar enable/ignore settings
5. Sync health dashboard
6. Token refresh / reconnect flow

## Phase 4: Songbook
1. PostgreSQL song records
2. Arrangement versioning
3. Role notes
4. member_song_state
5. Supabase Storage for reference audio/stems
6. signed URLs for private audio
7. practice player against cloud audio

## Phase 5: Show Hub
1. itinerary
2. venue contacts
3. load-in / soundcheck / set times
4. lodging
5. documents
6. show notes
7. setlists linked to Songbook

## Phase 6: Notifications
1. in-app realtime
2. email
3. PWA push
4. optional SMS later

## Phase 7: Public booking integration
Only after internal availability is trustworthy:
- expose a safe availability API
- return Full PA LINE / Duo / Solo states
- never expose individual conflict details
- create offers from qualified public booking requests


## Internal collaboration productionization
1. PostgreSQL rehearsal/meeting records
2. Realtime RSVP updates
3. Video provider integration or secure meeting-link generation
4. Realtime chat channels
5. Push notifications for new messages and event changes
6. Member-level channel permissions
7. Message retention and moderation controls
