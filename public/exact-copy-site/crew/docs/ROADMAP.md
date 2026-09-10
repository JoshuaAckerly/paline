# PA LINE v7.25 Production Roadmap

## Built into v7.25

- Server-side portal authentication with scrypt password hashing.
- HttpOnly SameSite sessions.
- Server-side authorization on protected APIs.
- Persistent SQLite/WAL database in the Data Vault.
- Server-mirrored application state.
- Server-backed authenticated crew chat.
- Server-side public booking and fan-demand intake.
- Tamper-evident contract/signature audit chain.
- Google Calendar OAuth + FreeBusy service code.
- Google Maps route-distance/time service code.
- Stripe Checkout deposit service code.
- Resend email delivery service code.
- Encrypted Google OAuth token storage.
- One-click owner service configuration.
- One-click release/server regression testing.

## Owner/account steps, not developer work

These services require credentials owned by PA LINE and cannot be bundled safely inside a ZIP:

1. Google Cloud credentials for Calendar and Maps.
2. Stripe secret key if online deposits will be accepted.
3. Resend API key and verified sender/domain if outbound email will be sent by the app.
4. A public HTTPS URL when the app is moved off the local computer.

Run `CONFIGURE_SERVICES.bat` to enter credentials. The application automatically reports which services are active.

## Optional future hosting work

The local v7.25 build is functional without a cloud provider. A future public multi-device deployment can move the server/database to hosted infrastructure. That is a deployment choice, not unfinished prototype logic.

Microsoft Outlook/365 calendar sync, SMS, WebAuthn/passkeys, and push notifications remain optional future enhancements rather than blockers for the current platform.
