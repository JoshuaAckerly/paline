# Quick Inquiry repair handoff

This directory preserves the repaired v7.23 standalone source from the supplied QUICK_INQUIRY ZIP for review and selective integration. It is not wired into Laravel or served by the production routes. Do not copy it over the newer public/exact-copy-site tree wholesale.

Implemented here: the five requested budget ranges (under $300, $300–599, $600–1,299, $1,300–2,499, $2,500+), known-venue address autofill, scrolling only on page transitions, submission validation and save failure handling, detailed/demand submission fixes, mobile layout repairs, and local vault safety fixes. See REPAIR_REPORT.md for test evidence and beta limitations.

Run from this directory with Node.js:

```
node scripts/validate-beta.mjs
node scripts/test-repairs.mjs
node server.mjs
```

The local server is for local testing only. Do not publish its vault or simulated authentication as production services. No vault records, credentials, test accounts, or port/process markers are included.

## Production integration still required

- Port the Quick Inquiry changes into the current production UI while retaining its newer theme and server integration.
- Wire inquiry receipt to the authoritative backend and verify visibility in COMMAND. A local save is not proof of delivery.
- Investigate the staged HTML publisher's HTTP 500 using server logs. Directory write permissions are a hypothesis, not a confirmed diagnosis.
- The most recent inspected GitHub deployment run (35967770828) was blocked by an account billing issue before execution.
- Member self-setup without repeated master-admin approval is requested but not implemented. Verify ownership of each member's registered email; do not permit arbitrary selection of another member or elevated role.
- Independent publishing access for Trever is requested but not implemented. It requires an authorized server access handoff.

Current instruction: add, commit, and push for review; the server owner handles deployment. Do not deploy this reference bundle directly.
