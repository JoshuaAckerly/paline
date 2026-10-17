# Production Backend Schema

Recommended backend: PostgreSQL via Supabase.

This is the target schema for replacing localStorage and IndexedDB.

## Identity and members

### profiles
- id uuid pk, maps to auth.users
- full_name text
- display_name text
- email text
- phone text
- home_base text
- is_admin boolean
- created_at timestamptz
- updated_at timestamptz

### member_roles
- id uuid pk
- member_id uuid fk profiles
- role_key text
- is_primary boolean

## Lineups

### lineups
- id uuid pk
- name text
- active boolean
- created_at timestamptz

### lineup_members
- lineup_id uuid fk lineups
- member_id uuid fk profiles
- required boolean
- sort_order integer
- primary key(lineup_id, member_id)

Future enhancement: add role-based requirements and approved substitutes rather than only exact members.

## Calendars and availability

### calendar_accounts
- id uuid pk
- member_id uuid fk profiles
- provider text: google, microsoft, ical
- provider_account_id text
- status text
- enabled boolean
- privacy_mode text default `free_busy_only`
- last_sync_at timestamptz
- token_secret_ref text, server-only
- created_at timestamptz

### calendar_sources
- id uuid pk
- calendar_account_id uuid fk calendar_accounts
- provider_calendar_id text
- display_name text
- enabled boolean

### calendar_busy_periods
- id uuid pk
- member_id uuid fk profiles
- source_id uuid nullable fk calendar_sources
- provider_event_hash text nullable
- starts_at timestamptz
- ends_at timestamptz
- source_type text: google, microsoft, ical
- availability_override text nullable: `available`
- override_updated_at timestamptz nullable
- override_updated_by uuid nullable fk profiles
- synced_at timestamptz

`availability_override = available` means the member explicitly marked that personal event as non-blocking for PA LINE. The provider event remains untouched.

Do not store event title/description/location for normal free/busy sync.

### manual_availability_blocks
- id uuid pk
- member_id uuid fk profiles
- starts_at timestamptz
- ends_at timestamptz
- private_reason text
- created_at timestamptz
- updated_at timestamptz

## Offers and shows

### offers
- id uuid pk
- venue_name text
- city text
- region text
- starts_at timestamptz
- ends_at timestamptz
- lineup_id uuid fk lineups
- pay_amount numeric nullable
- commitment_before_minutes integer
- commitment_after_minutes integer
- response_deadline timestamptz nullable
- admin_notes text
- status text: pending, confirmed, declined, cancelled
- created_by uuid fk profiles
- created_at timestamptz

### offer_recipients
- offer_id uuid fk offers
- member_id uuid fk profiles
- primary key(offer_id, member_id)

### offer_responses
- offer_id uuid fk offers
- member_id uuid fk profiles
- response text: available, unavailable, talk
- note text
- responded_at timestamptz
- primary key(offer_id, member_id)

### offer_notes
- id uuid pk
- offer_id uuid fk offers
- author_id uuid fk profiles
- visibility text: shared, private
- body text
- created_at timestamptz

### shows
- id uuid pk
- offer_id uuid nullable fk offers
- venue_name text
- city text
- region text
- starts_at timestamptz
- ends_at timestamptz
- commitment_starts_at timestamptz
- commitment_ends_at timestamptz
- lineup_id uuid fk lineups
- pay_amount numeric nullable
- admin_notes text
- status text
- created_at timestamptz

### show_members
- show_id uuid fk shows
- member_id uuid fk profiles
- primary key(show_id, member_id)

### show_notes
- id uuid pk
- show_id uuid fk shows
- author_id uuid fk profiles
- visibility text
- body text
- created_at timestamptz

## Songbook

### songs
- id uuid pk
- title text
- artist_writer text
- song_type text
- status text
- key_signature text
- time_signature text
- bpm integer
- length_seconds integer
- tuning text
- capo text
- count_in text
- admin_notes text
- published_at timestamptz nullable
- created_at timestamptz
- updated_at timestamptz

### song_role_notes
- id uuid pk
- song_id uuid fk songs
- role_key text
- body text

### song_arrangements
- id uuid pk
- song_id uuid fk songs
- version_label text
- summary text
- active boolean
- published_at timestamptz
- created_by uuid fk profiles

### song_audio_tracks
- id uuid pk
- song_id uuid fk songs
- storage_path text
- label text
- kind text: reference, live, rehearsal, click, stem
- stem_role text nullable
- duration_seconds numeric nullable
- created_at timestamptz

### member_song_state
- member_id uuid fk profiles
- song_id uuid fk songs
- learning_state text
- private_notes text
- reviewed_arrangement_id uuid nullable fk song_arrangements
- updated_at timestamptz
- primary key(member_id, song_id)

## Notifications and audit

### notifications
- id uuid pk
- user_id uuid fk profiles
- title text
- body text
- type text
- ref_type text nullable
- ref_id uuid nullable
- read_at timestamptz nullable
- created_at timestamptz

### activity_log
- id uuid pk
- actor_id uuid nullable fk profiles
- action text
- entity_type text nullable
- entity_id uuid nullable
- metadata jsonb
- created_at timestamptz

## Security / RLS outline

Members may:
- select their own profile
- update approved profile fields
- manage their own calendar accounts and manual blocks
- read offers they are recipients of
- write only their own offer response
- read shows they are assigned to
- write their own private notes and allowed shared notes
- read published Songbook material
- write their own member_song_state

Admins may:
- manage lineups
- manage offers/shows
- read aggregate availability
- manage Songbook
- manage notifications

Private calendar reasons and private member notes require explicit RLS policies preventing cross-member reads.


## Rehearsals and meetings

### rehearsals
- id uuid pk
- title text
- starts_at timestamptz
- ends_at timestamptz
- location text
- notes text
- blocks_availability boolean
- status text
- created_by uuid fk profiles
- created_at timestamptz
- updated_at timestamptz

### rehearsal_members
- rehearsal_id uuid fk rehearsals
- member_id uuid fk profiles
- primary key(rehearsal_id, member_id)

### rehearsal_rsvps
- rehearsal_id uuid fk rehearsals
- member_id uuid fk profiles
- status text: waiting, attending, tentative, unavailable
- responded_at timestamptz
- primary key(rehearsal_id, member_id)

### band_meetings
- id uuid pk
- title text
- starts_at timestamptz
- ends_at timestamptz
- meeting_url text
- agenda text
- blocks_availability boolean
- status text
- created_by uuid fk profiles
- created_at timestamptz
- updated_at timestamptz

### meeting_members
- meeting_id uuid fk band_meetings
- member_id uuid fk profiles
- primary key(meeting_id, member_id)

### meeting_rsvps
- meeting_id uuid fk band_meetings
- member_id uuid fk profiles
- status text
- responded_at timestamptz
- primary key(meeting_id, member_id)

## Crew chat

### chat_channels
- id uuid pk
- name text
- created_by uuid fk profiles
- created_at timestamptz

### chat_channel_members
- channel_id uuid fk chat_channels
- member_id uuid fk profiles
- primary key(channel_id, member_id)

### chat_messages
- id uuid pk
- channel_id uuid fk chat_channels
- author_id uuid fk profiles
- body text
- created_at timestamptz
- edited_at timestamptz nullable
- deleted_at timestamptz nullable

Realtime subscriptions should deliver new messages only to authorized channel members.


## Weekly Ops

### weekly_plans
- id uuid pk
- week_start date unique
- week_end date
- created_at timestamptz

### weekly_tasks
- id uuid pk
- weekly_plan_id uuid fk weekly_plans
- template_key text nullable
- owner_id uuid fk profiles
- category text
- title text
- detail text
- workload_points integer
- completed_at timestamptz nullable
- completed_by uuid nullable fk profiles
- member_note text
- sort_order integer

### weekly_task_templates
- id uuid pk
- owner_id uuid fk profiles
- category text
- title text
- detail text
- workload_points integer
- cadence text
- active boolean

COMMAND should validate the active default template totals to 100 workload points with the configured 40/20/20/20 allocation unless an admin deliberately creates a different plan.


### weekly_task_subitems
- id uuid pk
- weekly_task_id uuid fk weekly_tasks
- label text
- sort_order integer
- completed_at timestamptz nullable
- completed_by uuid nullable fk profiles

For tasks with subitems, parent completion is derived from all required subitems being complete. Completion credit is calculated from the actual member recorded on each checkbox rather than the planned task owner.


## Offer payout snapshots

### offer_member_cuts
- offer_id uuid fk offers
- member_id uuid fk profiles
- cut_percent numeric nullable
- cut_amount numeric nullable
- compensation_type text: member_cut, owner_draw
- primary key(offer_id, member_id)

For current PA LINE rules, assigned non-owner members use 20% of the entered offer amount. Trever uses compensation_type `owner_draw` with no fixed percentage.

Confirmed shows should snapshot the applicable payout calculation so later offer edits do not silently rewrite historical show compensation.


## Attendance and merch

### show_attendance
- show_id uuid pk fk shows
- expected_attendance integer nullable
- expected_source text: provided, estimated, projected
- expected_confidence text
- expected_basis text
- actual_attendance integer nullable
- actual_updated_at timestamptz nullable

### show_merch_summary
- show_id uuid pk fk shows
- forecast_low_gross numeric nullable
- forecast_mid_gross numeric nullable
- forecast_high_gross numeric nullable
- actual_gross numeric nullable
- restock_reserve numeric nullable
- distributable_pool numeric nullable
- updated_at timestamptz

Current merch accounting rule:
1. restock_reserve = actual_gross * 0.50
2. distributable_pool = actual_gross - restock_reserve
3. assigned non-owner members receive 20% each of distributable_pool
4. Trever remains owner_draw with no fixed percentage


## Commitment timing fields

Offers/shows should preserve:
- inbound_travel_minutes integer
- pre_show_buffer_minutes integer default 120
- performance_starts_at timestamptz
- performance_ends_at timestamptz
- post_show_buffer_minutes integer default 120
- outbound_travel_minutes integer
- commitment_starts_at timestamptz
- commitment_ends_at timestamptz

## Setlists

### setlists
- id uuid pk
- offer_id uuid nullable fk offers
- show_id uuid nullable fk shows
- locked boolean
- locked_at timestamptz nullable
- locked_by uuid nullable fk profiles
- created_at timestamptz
- updated_at timestamptz

### setlist_items
- id uuid pk
- setlist_id uuid fk setlists
- song_id uuid fk songs
- sort_order integer
- added_by uuid fk profiles
- added_at timestamptz

RLS should permit assigned band members to edit setlist_items only while the setlist is unlocked. Admin may edit and toggle lock state.


### gig_log_entries email fields
- email_thread_id text nullable
- email_message_id text nullable
- email_subject text nullable
- email_direction text nullable: inbound, outbound

Unique protection should prevent the same email_message_id from being attached twice to the same timeline.
