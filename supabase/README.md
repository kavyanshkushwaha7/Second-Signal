# SecondSignal Supabase setup

## Current status

The foundation and profile-media ownership migrations have been applied to the
connected Supabase project. All 16 app tables have RLS enabled. Email/password
login is enabled and email confirmation is required.

The existing website remains the labelled local demo until the connected flows
are implemented and tested. Adding connection settings does not turn it into a
live marketplace.

## Applying to a new Supabase project (not the already migrated project)

1. Open the **same Supabase project** used for the configured Project URL.
2. Open **SQL Editor → New query**.
3. Copy the complete contents of
   `supabase/migrations/202611090001_secondsignal_foundation.sql` and run it once.
4. Run `supabase/migrations/202611090002_profile_media_ownership.sql` next.
5. On success, tell the agent the migrations were applied. If they fail, provide the
   error text only (no keys, passwords or connection strings).

This migration creates new tables and private Storage buckets; it does not delete
existing data or insert sample users/content. It runs in one transaction and
intentionally fails on conflicting table names instead of overwriting them.
Do not rerun a successful migration. Do not disable RLS to work around an error.

## Security and access

- Only email-verified accounts may use the app tables.
- Public student profiles are visible to other signed-in, verified students.
- Email and password credentials remain in Supabase Auth, not public profiles.
- Contact details, preferences, saved items and notifications are owner-only.
- Conversations and messages are restricted to their two participants.
- Column grants prohibit rewriting author IDs, timestamps and ownership.
- Reviews require a completed request confirmed by both participants.
- Request and notification creation is initially locked down. The workflow phase
  must add atomic database functions/event triggers before enabling those actions.
- Private media buckets use signed URLs, owner-prefixed paths and MIME/size limits.
  Avatar uploads are limited to 5 MiB; post media to 50 MiB.
- No service-role key is needed in the browser. Never use a secret key in a
  `VITE_` variable.

## Auth configuration still required

Before testing email confirmation and recovery, configure **Authentication → URL
Configuration** to allow the app's callback and password-reset URLs. The agent
will supply the exact route URLs when the auth screens are implemented. Keep
email confirmation enabled. Configure a production SMTP provider before inviting
students at scale; development email quotas are not a production delivery setup.

## Remaining implementation and validation

Run `node supabase/verify-foundation.mjs` to check database authorization using
temporary fixtures. It verifies the configured PostgreSQL target matches the
Supabase API project, validates TLS using the official Supabase CA, and rolls
back every test record. It uses the server-only `SUPABASE_DATABASE_URL` secret.
The certificate in `certs/` is a public CA certificate, not a credential.

These tests cover verified/unverified/anonymous access, author ownership,
conversation privacy, private contacts/saves, constraints, protected workflow
tables and media ownership. They do NOT test browser login, email delivery,
password reset, signed upload/download URLs or realtime delivery. No live
account UI flow has passed yet.

Next phases wire authentication/onboarding, the seven-type post composer, database
feeds/profiles, private messaging, atomic request transitions and event-driven
notifications. Existing community and friend-request features must also be
preserved as their data layer is migrated; this foundation does not yet add their
additional tables. Do not claim the full-stack upgrade is complete.
