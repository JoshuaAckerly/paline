Read `.github/copilot-instructions.md`, `docs/COPILOT_CONTEXT.md`, `docs/BUSINESS_RULES.md`, and `docs/SAFE_REFACTOR_PLAN.md` before changing code.

This is the approved PA LINE booking prototype migrated into VS Code. Preserve behavior first.

Your first task:

1. Run or inspect `npm run validate` and report any failures before editing.
2. Map the major responsibilities currently inside `src/app.js` without changing behavior.
3. Propose a staged refactor that starts by replacing inline event handlers with `addEventListener` while keeping every current screen working.
4. Do not change pricing, travel, budget, Route Savings, legal-document, or same-day scheduling rules.
5. Do not convert `app.js` to an ES module until inline handlers are removed or all required handlers are safely exposed to `window`.
6. Keep PA LINE capitalized exactly and do not use em dashes in user-facing text.

Before applying any large change, tell me exactly which files you will touch and which acceptance flows you will retest.
