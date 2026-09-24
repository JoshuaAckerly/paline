# PA LINE Platform

Canonical public entry: `index.html`

Public Booking: `booking/index.html`
Private Crew & Command: `crew/index.html`
Booking bridge: `shared/bridge.js`
Server client: `shared/server-core.js`
Local recovery client: `shared/vault.js`

The platform has one public entry with two destinations: **Booking** and **Crew & Command**.

Booking requests are submitted to the PA LINE backend for review. The public site does not self-confirm a date, price, or agreement. Final routing, pricing, production terms, and agreements are handled after PA LINE review.

Crew & Command requires secure profile sign-in. Trever Stribing is the full-control Command administrator. Other active profiles use the simplified Crew portal.
