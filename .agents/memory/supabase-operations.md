---
name: Supabase operations
description: External database migration and certificate validation boundaries.
---
Use the explicitly configured external Supabase database for SecondSignal migrations, not the workspace's unrelated Replit database.

**Why:** The user chose Supabase and authorised non-destructive schema creation. Replit's database tools and publish migration flow target a different database.

**How to apply:** Check that the external connection's project matches the Supabase API project before executing DDL, inspect for conflicting objects, and apply ordered SQL migrations transactionally. Never expose the database connection to browser code.

Validate the PostgreSQL TLS certificate using Supabase's official root CA; do not disable certificate verification to bypass a self-signed-chain error.

**Why:** The Supabase pooler requires its root CA in this environment. Generic Node trust failed even though the project was correct.

**How to apply:** Use the public CA from Supabase's documented certificate distribution, preserving hostname verification. Database tests must roll back their fixtures and must not be represented as end-to-end authentication tests.
