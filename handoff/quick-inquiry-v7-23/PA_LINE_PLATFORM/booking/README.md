# PA LINE Booking Beta v7.21

`index.html` is the current public booking beta runtime. It integrates with `../shared/bridge.js` and `../shared/vault.js`.

The original four booking paths remain, plus the special-booking channel with Residency, Open Mic, PR / Media, Charity / Fundraiser / Benefit, and Other / Custom. Each special type has its own funnel.

PUBLIC -> COMMAND always uses secure sign-in. Production-only integrations such as verified email, real routing providers, payment processing, and production authentication remain clearly identified as not yet connected.
