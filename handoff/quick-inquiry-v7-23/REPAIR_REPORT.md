# PA LINE v7.23 — repaired build

Based directly on PA_LINE_PLATFORM_BETA_v7_23_QUICK_INQUIRY.zip. Existing design, data keys, seed data, and detailed booking features are retained. No test accounts, inquiries, or vault data are included.

## Fixes

- Fixed the exact-date calendar crashing on held/unavailable dates (`max` was undefined). Added keyboard access to selectable dates and used local calendar dates to prevent timezone shifts.
- Quick Inquiry validates email and requires a phone number when phone/text follow-up is selected. Failed storage no longer shows a false success screen; entered information stays on the form.
- Added optional timing notes. Budget, timing, contact preference, source path, and availability now appear in COMMAND lead notes. Inquiries no longer invent a performance time or lineup.
- COMMAND persists an imported lead before marking its inquiry imported, protecting against lost imports after storage failure.
- Fixed Master Admin tool navigation: the security allowlist now includes tools behind the simplified menu. Added applicable hub pages to crew/member access rules.
- Fixed the Shows hub calling two nonexistent functions.
- Fixed mobile toolbar overflow on long page titles and restored a visible search control. Linked static inquiry labels to their fields.
- Flexible-date searches clear stale selections and explain when no matching dates exist.
- Malformed URL escapes and null bytes no longer crash the server. Directory URLs redirect to a trailing slash so relative assets load.
- Backup import validates snapshots, creates a safety backup first, and rolls back browser data if storage fails. Reset stops if its safety backup fails. The server rejects malformed snapshots instead of replacing good data with an empty snapshot.
- Updated active version markers and startup instructions. Background server launches hidden.

## Verification

Ran the Node app with a separate test vault and a fresh Chromium browser. No normal PA LINE vault or existing account was used.

- 16 browser assertions passed across all five Quick Inquiry paths, invalid input, simulated storage failure, unavailable-date alternatives, location prefill, and stale flexible-date selections.
- Submitted an inquiry through form controls. All six test inquiries reached COMMAND; re-importing created no duplicates. Opened, edited, and saved an imported lead.
- Created a disposable local account, completed security setup, and signed back in after reload.
- Rendered all 25 unique COMMAND pages at 320px, 390px, and 1440px widths. No rendering exceptions or page-level horizontal overflow remained. The pipeline retains intentional internal horizontal scrolling.
- Inspected booking, inquiry, calendar, COMMAND, and pipeline screenshots. Checked both public/COMMAND links.
- Confirmed detailed booking remains accessible through `?bookingStep=2`: event details, demand, special booking, and returning access open. The complete contract/signature workflow was not re-certified.
- Original release validation passes. `node scripts/test-repairs.mjs` passes tests for pages/assets, redirects, malformed paths, vault validation/safety backups, audio round trip, inquiry storage, inline JavaScript syntax, and backup-import rollback.

## Remaining beta limitations

- This remains a local, single-computer beta. The server listens on 127.0.0.1. Mobile checks used viewport emulation, not physical phones; the launcher does not publish the app to phones or the internet.
- Requests and credentials are local. This is not production multi-user authentication or cross-device synchronization. Do not expose the local vault API publicly.
- Email/SMS delivery is not connected; follow-up is manual. Inquiry success means saved locally, not an email sent.
- Calendar data includes a fixed snapshot and simulated holds; mileage/routing estimates are simulated. Live availability, road routing, and external calendar integrations require real services.
- Detailed Step 2 URLs preserve existing functionality; they are not secure invitation tokens.
- Separate browsers/devices do not have reliable concurrent synchronization. Automatic vault saves are best-effort; maintain downloaded backups. JSON backup exports do not include practice-audio binaries, which remain in the local vault's audio folder.

## Run and test

Extract the ZIP and double-click `START_PA_LINE.bat` on Windows with Node.js installed. Keep the normal stable port/browser origin to retain existing data. The marker reads **BETA v7.23 · REPAIRED**. `VALIDATE_BETA.bat` runs both validation suites.

The optional `scripts/browser-inquiry-check.js` and `scripts/browser-command-check.js` are browser-console checks, not Node scripts. Run only on a disposable test instance: the inquiry check creates test records. The COMMAND check requires a signed-in test admin. Do not run them against real data.

## Browser feedback update
- Quick Inquiry venue selections now autofill known street address, city, state, and ZIP. The address is retained in inquiry notes sent to COMMAND.
- Late lookup responses only fill untouched blank fields and cannot replace a newly selected venue or manual edits. Ambiguous lookup results are not guessed.
- Removed the global click-to-top handler. Page transitions start at the top; date and budget selections retain scroll position.
- Verified known-venue autofill through the suggestion UI, stable scroll for date and budget selection, top-of-page navigation, mobile field layout, and no browser errors. Isolated regression tests passed.

## Additional booking bug check
- Replaced the global submit-button text interceptor with an explicit detailed-booking save after final confirmation. Buyer name/email/phone, selected lineup, attendance, actual quote total, and booking notes are retained.
- Detailed fan-demand requests now save after final review/signature, not when first opening the review page.
- Failed detailed, demand, and special saves keep the form available for retry. Special booking now validates email. Repeated completed submissions are guarded against duplicates.
- Confirmation screens escape user-entered text instead of treating it as HTML.
- Passed 16 Quick Inquiry checks, 9 detailed/demand/special submission checks, a literal-text rendering check, original validation, and the server/vault regression suite. No browser errors were recorded in this test session.
- browser-submission-check.js is an optional browser-console regression for a disposable test instance at ?bookingStep=2. It creates fake records and manipulates review state to exercise handlers; do not run it against live records. This is not a certification of every contract/payment integration.
