# Operational Bootstrap Contract

## Operational Onboarding Guarantees
- The onboarding process is atomic. A tenant is either fully operational (bootstrapped) or does not exist.
- There are no partial onboarding states exposed to the application tier.

## Onboarding Invariants
- A unique `tenant_slug` must be globally guaranteed.
- The user triggering the onboarding must be strictly mapped as the first `public.staff` record.
- The `tenant_id` must be correctly injected into the user's `app_metadata` in Supabase Auth.

## Required Bootstrap Entities
Every successful onboarding operation MUST synchronously create:
1. One `public.tenants` record.
2. One `public.office_locations` record.
3. One `public.disciplines` record.
4. One `public.staff` record linked to the `auth.users.id`.
5. One `public.staff_rate_periods` record defining the initial billing and cost rates for the staff member.

## Idempotency Guarantees
- Submitting the same onboarding request multiple times will result in either a clean success or an explicit `AlreadyOnboarded` rejection. Duplicate tenants or orphaned staff records will not be created.

## Forbidden Onboarding Behaviors
- Direct client-to-database mutations are strictly forbidden.
- Inserting partial data (e.g., creating a tenant without staff) is strictly forbidden.
- Using the `public` Postgres role for inserting onboarding data is forbidden (bypassing RLS safely requires the Service Role or a Security Definer function).

## RLS Preservation Guarantees
- The bootstrap transaction operates under elevated privileges (Service Role / Security Definer) specifically because the user does not yet possess the `tenant_id` claim required to insert their own records.
- Immediately after onboarding, all subsequent requests must flow through standard RLS mechanisms.

## Tenant Ownership Guarantees
- The bootstrapping user is implicitly granted full operational authority over the created tenant by virtue of being the only active staff member.

## Operational Staff Requirements
- The initial staff record must possess valid `first_name`, `last_name`, `email` (matching the auth user), and non-negative `cost_rate` and `bill_rate` parameters to satisfy temporal financial requirements immediately.
