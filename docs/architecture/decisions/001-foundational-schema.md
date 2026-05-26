# ADR 001 — Foundational Schema Design

- **Status**: Accepted
- **Date**: 2026-05-26
- **Deciders**: Visagan Ganesalingam (product), AI architect (implementation)

## Context

Plinth is an AI-native practice management platform for structural engineering
consultancies operating in New Zealand, Australia, and the UK. The first customer
is Kirk Roberts Consulting (NZ). The schema produced in Weekend 1 is the contract
every future module obeys for the entire 12-weekend build.

Key constraints driving this decision:

1. **Single-tenant now, multi-tenant soon** — Kirk Roberts is the only tenant for
   the first 6 months, but adding multi-tenancy later means a full rewrite.
2. **Legally significant domain** — Engineers issue Producer Statements (PS1/PS3/PS4)
   that determine whether buildings are safe. The audit trail must be admissible in
   a Professional Indemnity insurance investigation 7 years from now.
3. **Schema drift is catastrophic** — Future modules (documents, fees, time entries,
   comms) must build on this foundation without altering it. Getting it right now
   costs a weekend; getting it wrong costs the project.

## Decision

### Multi-tenancy: `tenant_id` on every table from day one

Every table carries `tenant_id uuid not null` with a bootstrap default of
`'00000000-0000-0000-0000-000000000001'`. Row Level Security policies on every
table enforce tenant isolation via `auth.jwt() -> 'app_metadata' ->> 'tenant_id'`.

The bootstrap default and the `coalesce` fallback in RLS policies enable
single-tenant operation without JWT claims. Both **must be removed** before
multi-tenant launch.

### Lookup tables over PostgreSQL enums

Fields whose values may evolve (job statuses, types, risk tiers, disciplines,
office locations) are modelled as lookup tables with `(tenant_id, code)` unique
constraints, not as PostgreSQL `enum` types.

### Lookup tables are tenant-scoped

Each lookup table carries `tenant_id`, allowing per-tenant customisation of
statuses, disciplines, risk tiers, etc. The bootstrap tenant's rows serve as
the template for new tenants.

**Future requirement**: Before multi-tenant launch, a
`seed_lookups_for_new_tenant(new_tenant_id uuid)` function must be created to
copy the bootstrap tenant's lookup rows to a new tenant. Without this, new
tenants would have empty lookup tables and the application would break.

### `ON DELETE RESTRICT` as the default

Every foreign key uses `ON DELETE RESTRICT` unless the child row has no
independent meaning. Exceptions are explicitly documented:
- Junction tables (`job_offices`, `job_disciplines`) — `ON DELETE CASCADE`
- Structural children (`job_scopes` → `job_phases`, `job_components` → `job_scopes`) — `ON DELETE CASCADE`

### Check constraints over application validation for invariants

Where a business rule is absolute (hourly rates > 0, fee values ≥ 0, risk tier
thresholds > 0), the database enforces it via `CHECK` constraints. The one
exception is the risk rule (`fee_value > project_risk_value`) which the
application must allow-with-confirmation.

### JSONB for addresses

`clients.billing_address` and `jobs.site_address` use `jsonb` rather than
normalised address columns. This provides flexibility for NZ/AU/UK address
format differences without schema changes.

### `citext` for email columns

`staff.email` and `client_contacts.email` use the `citext` extension for
case-insensitive storage and comparison, avoiding `lower()` wrapper bugs in
application code.

### `updated_at` trigger on every table

A single reusable `set_updated_at()` function is attached to every table via
a `BEFORE UPDATE` trigger. This is more reliable than relying on application
code to set `updated_at`.

### Audit columns on business tables only

`created_by` and `updated_by` referencing `staff(id)` appear on business tables
(staff, clients, client_contacts, jobs, job_phases, job_scopes, job_components).
They do not appear on:
- `tenants` (created by system admin, not a staff member)
- Lookup tables (system-managed reference data)
- Junction tables (no independent meaning)

### GDPR / NZ Privacy Act 2020 compliance by design

Because every table carries `tenant_id`, a tenant's complete dataset can be
retrieved via `WHERE tenant_id = X` queries against every table. This supports
per-tenant data export and right-to-erasure requests without complex joins or
custom extraction logic.

## Consequences

### Benefits

- **Multi-tenant ready from day one** — no rewrite required when tenant #2 onboards
- **Tenant isolation at the database level** — even application bugs cannot leak data
- **Evolving lookup values** — adding a new job status or discipline is an INSERT, not a migration
- **Per-tenant customisation** — each tenant can configure their own statuses, risk tiers, and rates
- **Audit trail integrity** — `created_by`/`updated_by` + `created_at`/`updated_at` on every business record
- **Data sovereignty** — per-tenant data export for regulatory compliance

### Costs

- **More joins** — lookup tables mean `LEFT JOIN` instead of inline enum values. Mitigated by: lookup tables are small and heavily cached by PostgreSQL.
- **More indexes** — every FK column gets an index, plus composite indexes for common queries. Mitigated by: the dataset is small (thousands of jobs, not millions) and write-heavy operations are infrequent.
- **Verbose RLS policies** — 60 policies across 15 tables. Mitigated by: generated from a consistent template, easy to audit.
- **Bootstrap complexity** — the first staff row has null audit columns, requiring special handling in application code. Mitigated by: documented pattern, affects only initial setup.
- **`tenant_id` redundancy** — `tenant_id` on every row is denormalised (could be derived via FK chain to parent). Accepted because: RLS requires it on every table for efficient filtering without joins.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| **PostgreSQL enums for statuses** | Cannot be modified per tenant; `ALTER TYPE ... ADD VALUE` cannot run inside a transaction; painful to rename or remove values |
| **Single-tenant schema, add multi-tenancy later** | "Later" means altering every table, every query, every policy. The cost of adding `tenant_id` now is near zero; the cost of adding it later is a full rewrite. |
| **Schema-per-tenant** | More complex operationally (N schemas to migrate); poor fit for Supabase's RLS model; cross-tenant reporting becomes difficult |
| **Normalised address tables** | Over-engineering for 3 countries with different address formats; JSONB provides adequate structure with less schema rigidity |
| **`ON DELETE CASCADE` everywhere** | Catastrophic in a domain where accidental deletion of a client or staff member should be blocked, not silently propagated |
| **`ON DELETE SET NULL` for audit columns** | Losing the identity of who created a record defeats the purpose of an audit trail. `RESTRICT` forces explicit handling. |
| **No FK on `auth_user_id`** | Chosen approach: `auth_user_id` is a plain UUID column, not a FK to `auth.users`. This avoids coupling DDL to the auth schema, which is managed by Supabase and may not be available during testing. Application code enforces the link. |
