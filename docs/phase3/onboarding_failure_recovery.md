# Onboarding Failure Recovery

## Onboarding Transaction Boundaries
The onboarding process involves creating an `auth.users` record, generating a `public.tenants` record, linking the user to `public.staff`, and injecting a JWT claim. This spans both the Supabase GoTrue service and the Plinth PostgreSQL database.
Because we cannot wrap an external GoTrue call and a PostgreSQL insert in a single distributed transaction, the transaction boundary is defined purely at the **database level** via a PostgreSQL Trigger acting on the `auth.users` insert.

## Partial Failure Handling
If the GoTrue service successfully creates a user, but the PostgreSQL trigger fails (e.g., a constraint violation during `public.tenants` creation):
- The `auth.users` creation will rollback automatically if the trigger is a `BEFORE INSERT` or `AFTER INSERT` trigger that raises an exception.
- If executed via an Edge Function/Webhook, it will be considered a partial failure.
- We enforce strict rollback by using a PostgreSQL Trigger to ensure atomicity. If the tenant/staff creation fails, the entire transaction is aborted, preventing an orphaned `auth.users` record.

## Retry Behaviour
If the onboarding request fails due to network latency:
- Client-side: Present a generic error and allow the user to resubmit.
- Server-side webhook (if used): Retries are handled via exponential backoff (max 3 retries) before entering a dead-letter queue.

## Idempotency Strategy
- Tenant slugs and email addresses act as unique constraints.
- If a user tries to onboard twice with the same email, GoTrue natively blocks it.
- If a webhook fires twice for the same user ID, `ON CONFLICT (id) DO NOTHING` or `DO UPDATE` ensures duplicate staff/tenant records are not created.

## Orphan Cleanup Rules
- Scheduled cron job (e.g., `pg_cron` or Edge Function) scans for `auth.users` without a corresponding `public.staff` record older than 1 hour.
- Orphaned users are hard-deleted to prevent dangling accounts and free up the email.

## JWT Propagation Failure Handling
- If the custom JWT claim injection hook fails, the user will have a valid session but no `tenant_id` in their token.
- **Handling**: Our Next.js Middleware detects missing `tenant_id` claims and automatically forces a session refresh or redirects the user to a hard failure page (`/onboarding/error`), instructing them to log out and log back in.

## Tenant Creation Rollback Expectations
- A tenant is only considered "Active" once all bootstrap infrastructure (default rate periods, office locations) is created.
- If a failure occurs mid-bootstrap, the tenant remains in an `INCOMPLETE` state. 
- Incomplete tenants cannot access the operational system and are purged after 24 hours via automated cleanup.
