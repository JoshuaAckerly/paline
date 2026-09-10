# PA LINE Booking Platform
## Web Developer Handoff - v51

This folder is the current public-booking prototype handoff.

### Source of truth
`index.html`

### Latest changes included
- Privacy-safe routing language. Trever's residential street address is not displayed or shipped in the public booking HTML.
- Public routing language uses `PA LINE routing base`.
- Legal/rider review modals reset to the top of the document every time they are opened.
- Existing booking/pricing/routing/legal behavior from the prior v50 developer package is preserved.

### Important
This is still a functional browser prototype, not final production infrastructure.

Production implementation should replace simulated/local browser systems with:
- secure server-side persistence
- authenticated sessions
- server-side price and availability validation
- live calendar synchronization
- live mapping/routing
- immutable legal-document versioning and audit records
- production booking approval workflow

### Privacy requirement
Do not expose the artist owner's private residential address in public UI, client-visible configuration, HTML, JavaScript, logs, analytics events, legal previews, or routing explanation text.

Internally, production routing may use a private routing origin stored server-side. Public users should see only wording such as `PA LINE routing base`.

### Current relationship to PA LINE CREW + COMMAND
The public booking application and private CREW + COMMAND application are still separate prototypes.
The intended production bridge is:

Public booking request
-> COMMAND incoming offer
-> member availability/responses
-> Trever approval
-> confirmed show / Show Hub

Do not merge the two codebases casually without preserving the documented booking rules and private-member permissions.
