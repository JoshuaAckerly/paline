# CURRENT HANDOFF VERSION: v51

See `WEB_DEVELOPER_HANDOFF_v51.md` first.

# PA LINE Booking Platform - VS Code / Copilot Migration Build v50

This folder is the current PA LINE booking prototype converted from one large HTML file into a normal local development project.

The migration intentionally preserves the proven v49 browser behavior first. It does **not** perform a risky React/Next/framework rewrite yet.

## Quick start on Windows

1. Install **Node.js LTS** if it is not already installed.
2. Extract this project folder somewhere permanent, for example:

   `C:\Users\Treve\Documents\PA_LINE_Booking`

3. Open **Visual Studio Code**.
4. Choose **File > Open Folder** and select this project folder.
5. Open the VS Code terminal with **Terminal > New Terminal**.
6. Run:

```bash
npm run validate
npm run dev
```

The basic dev server uses only Node.js. No package install is required for this first run.

7. Vite will print a local address, usually:

```text
http://localhost:5173
```

Open that address in Chrome or Edge.

## Before using Copilot

Install/sign in to the recommended GitHub Copilot extensions when VS Code prompts you.

Then open:

- `.github/copilot-instructions.md`
- `docs/COPILOT_CONTEXT.md`
- `docs/SAFE_REFACTOR_PLAN.md`

Copilot should read those before making structural changes.

A ready-to-paste first prompt is in `COPILOT_START_PROMPT.md`.

## Project layout

```text
PA_LINE_Booking_VSCode_Copilot_v50/
├─ index.html                     Current UI markup and embedded legal review templates
├─ src/
│  ├─ app.js                      Current booking logic
│  └─ styles.css                  Current visual system
├─ assets/
│  ├─ pa-line-rose-web.png        Optimized artwork used by the app
│  └─ pa-line-rose-source.png     Original source artwork
├─ legal/
│  ├─ Performance_Agreement_v49.docx
│  ├─ Stage_Plot.html
│  ├─ Technical_Rider.html
│  └─ Personal_Hospitality_Rider.html
├─ docs/
│  ├─ COPILOT_CONTEXT.md
│  ├─ BUSINESS_RULES.md
│  ├─ PRODUCTION_BACKLOG.md
│  └─ SAFE_REFACTOR_PLAN.md
├─ scripts/
│  └─ validate.mjs
├─ .github/
│  └─ copilot-instructions.md
├─ .vscode/
│  ├─ extensions.json
│  ├─ settings.json
│  └─ tasks.json
├─ original/
│  └─ PA_LINE_Booking_FINAL_PRESENTATION_v49_BUDGET_LEGAL_ITEMIZED.html
├─ COPILOT_START_PROMPT.md
├─ package.json
└─ README.md
```

## Commands

```bash
npm run dev
```
Starts the zero-dependency Node development server.

```bash
npm install
npm run dev:vite
```
Optional Vite dev server with hot reload.

```bash
npm run validate
```
Runs migration integrity checks, including JavaScript syntax, duplicate HTML IDs, missing `$()` DOM references, and critical business-rule markers.

```bash
npm run build
```
Creates a deployable static build in `dist/`.

```bash
npm run preview
```
Previews the built `dist/` version locally.

## Why app.js is not an ES module yet

The current prototype has inline handlers such as `onclick="openQuote()"`. Browser functions used by those handlers must remain globally available.

The safest migration sequence is:

1. preserve functionality,
2. replace inline handlers with `addEventListener`,
3. add automated tests,
4. move business logic into modules,
5. connect real backend services.

Do not start by blindly converting `app.js` to `type="module"`. That will break the current inline interactions unless the functions are exported onto `window` or the handlers are refactored first.

## Current prototype vs production

This project is presentation/prototype-grade. Some services are intentionally simulated:

- email magic-link delivery,
- secure backend authorization,
- real road mileage/routing,
- authoritative live booking calendar,
- payment/refund processing,
- server-side legal document storage/audit.

The business behavior should be preserved while those simulations are replaced.

## Legal document editing

The current interface includes the **LEGAL DOCS** manager. In this migration build its active edits persist in browser `localStorage`.

The production implementation should move legal documents to a secured admin database/object-storage system with immutable versions. Every booking must permanently retain the exact document versions accepted by the signer.

## Source of truth

For behavior, the first source of truth is the working v49 prototype copied under `original/`.

For business rules, use `.github/copilot-instructions.md` and `docs/BUSINESS_RULES.md`.
