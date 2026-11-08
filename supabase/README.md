# SecondSignal Supabase setup

## Current status

The configured project responds to the Auth API. Email/password login is enabled
and email confirmation is required. The initial check found no `public.profiles`
table in its API schema. No schema changes have been applied by the agent.

The existing website remains the labelled local demo until the connected flows
are implemented and tested. Adding connection settings does not turn it into a
live marketplace.

## Apply the foundation

1. Open the **same Supabase project** used for the configured Project URL.
2. Open **SQL Editor → New query**.
3. Copy the complete contents of
   `supabase/migrations/202611090001_secondsignal_foundation.sql` and run it once.
4. On success, tell the agent the migration was applied. If it fails, provide the
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

The SQL has been prepared but has NOT yet been run against the connected project.
RLS and Storage policies must be tested with two real test accounts and an
unauthenticated client after applying it. No live account flow has passed yet.

Next phases wire authentication/onboarding, the seven-type post composer, database
feeds/profiles, private messaging, atomic request transitions and event-driven
notifications. Existing community and friend-request features must also be
preserved as their data layer is migrated; this foundation does not yet add their
additional tables. Do not claim the full-stack upgrade is complete.
