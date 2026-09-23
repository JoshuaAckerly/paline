# AGENTS.md — PA LINE Booking Platform

Guidance for AI coding agents (Codex CLI, etc.) working in this repository.
Read this before making changes.

## What this project is

PA LINE is a Laravel + React (Inertia) web application. The current focus is the
**booking platform** for PA LINE performances: pricing, availability, routing,
recurring dates, budget-fit, and a versioned legal acknowledgment flow.

Active task list and product decisions live in `BOOKING_TODO.md`. Treat it as the
source of truth for what is done vs. pending, and follow the "Source priority"
list at the top of that file.

## Tech stack

- **Backend:** PHP 8.3, Laravel 13
- **Frontend:** React 19 + TypeScript via Inertia.js (`@inertiajs/react`), Vite
- **Styling:** Tailwind CSS v4
- **Email:** Resend (`resend/resend-php`)
- **Maps/Routing:** Mapbox (geocoding + directions), behind provider interfaces
- **Tests:** PHPUnit (backend), Vitest + Testing Library (frontend)

## Project layout

- `app/Domain/Booking/` — core booking domain: pricing, availability, routing,
  recurring dates, route savings, budget-fit, legal acknowledgment. Prefer
  putting business logic here, kept framework-light and unit-tested.
- `app/Services/` — application services (calendars, magic link, Mapbox providers,
  quote estimator).
- `app/Http/Controllers/` — HTTP layer; `Admin/` and `Auth/` subfolders.
- `app/Models/` — Eloquent models.
- `resources/js/pages/` — Inertia page components (`admin/` for the admin area).
- `resources/js/Components/` — shared React components.
- `routes/` — route definitions.
- `tests/` — PHPUnit tests; `resources/js/**/__tests__/` — Vitest tests.

## Common commands

Backend (Composer):

```bash
composer install          # install PHP deps
composer test             # config:clear + php artisan test
php artisan test          # run PHPUnit directly
./vendor/bin/pint         # format PHP (Laravel Pint)
```

Frontend (npm):

```bash
npm install
npm run dev               # Vite dev server
npm run build             # production build
npm run build:ssr         # build + SSR build
npm run test              # vitest run
npm run types             # tsc --noEmit (type check)
```

Local dev shortcut: `composer dev` (runs `php artisan dev`) or `./start-dev.sh`.

## Conventions

- **Domain-first:** put booking business rules in `app/Domain/Booking/` with unit
  tests, not in controllers. Controllers stay thin.
- **Provider interfaces:** external services (routing, geocoding) sit behind the
  contracts in `app/Contracts/`. Add real + fallback implementations rather than
  calling APIs inline. See `MapboxRoutingProvider` / `UnavailableRoutingProvider`.
- **Match existing style.** Follow the patterns already in the neighboring files.
  Run Pint for PHP and keep TypeScript strict (`npm run types` must pass).
- **Pricing is protected.** Never expose individualized/protected pricing to
  unauthenticated or unverified users. Budget-fit results must not leak protected
  numbers (see `BudgetFitEvaluator`).
- **Legal versions are immutable.** Legal documents use versioned, immutable
  records with acceptance audit records — do not mutate existing versions.

## Verification before you finish

Always run the relevant checks and fix failures before wrapping up:

1. `composer test` (backend changes)
2. `npm run types` and `npm run test` (frontend changes)
3. `./vendor/bin/pint` (PHP formatting)

## Git workflow

- **Do not commit to `main` directly.** Work on a feature branch, e.g.
  `feature/<short-description>` (see existing `feature/booking-flow-prototype-parity`).
- Open a Pull Request into `main` on GitHub (`JoshuaAckerly/paline`) for review.
- Keep commits focused; do not commit secrets. `.env`, `auth.json`, `/.codex`,
  and editor folders are already gitignored.
- Do not commit generated artifacts (`/public/build`, `/vendor`, `/node_modules`).

## Things to avoid

- Do not extract the v50 prototype ZIP over this Laravel app; it is reference only.
- Do not add AI/API keys or `.env` values to version control.
- Do not weaken the booking access, pricing-protection, or legal-acknowledgment
  gates.
