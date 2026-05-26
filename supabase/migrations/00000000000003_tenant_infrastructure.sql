-- =============================================================================
-- Plinth - Migration: 00000000000003_tenant_infrastructure
-- =============================================================================
-- Phase 1: Foundational Hardening
-- 
-- 1. Centralized Tenant Resolution: Creates `current_tenant_id()` function and
--    replaces hardcoded UUID defaults across all tables.
-- 2. Sequence Generation: Creates `tenant_sequences` and `generate_next_sequence()`
--    per ADR 010 (Sequence Generation Strategy).
-- 3. Event Infrastructure: Creates partitioned `domain_events` append-only 
--    log per ADR 008 (Event-Driven Architecture).
--
-- This migration is additive and non-destructive.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Centralized Tenant Resolution
-- ---------------------------------------------------------------------------
-- Encapsulates JWT parsing and bootstrap fallback into a single function.
-- Required for multi-tenant safety and simplifies RLS policy rewrites.
--
-- NULL SAFETY: 
-- This function is guaranteed to return a valid UUID. If no JWT is present 
-- or the tenant_id claim is missing, it coalesces to the bootstrap tenant.
-- It will NEVER silently return NULL for an authenticated request.
-- ---------------------------------------------------------------------------
create or replace function public.current_tenant_id()
returns uuid as $$
begin
  return coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid
  );
  -- FUTURE MULTI-TENANT LAUNCH: Replace body with strict check:
  -- return (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid;
end;
$$ language plpgsql stable;

-- Apply centralized default to all existing lookup tables
alter table public.tenants alter column tenant_id set default public.current_tenant_id();
alter table public.job_statuses alter column tenant_id set default public.current_tenant_id();
alter table public.job_types alter column tenant_id set default public.current_tenant_id();
alter table public.risk_tiers alter column tenant_id set default public.current_tenant_id();
alter table public.disciplines alter column tenant_id set default public.current_tenant_id();
alter table public.office_locations alter column tenant_id set default public.current_tenant_id();

-- Apply centralized default to all existing core tables
alter table public.staff alter column tenant_id set default public.current_tenant_id();
alter table public.clients alter column tenant_id set default public.current_tenant_id();
alter table public.client_contacts alter column tenant_id set default public.current_tenant_id();
alter table public.jobs alter column tenant_id set default public.current_tenant_id();
alter table public.job_offices alter column tenant_id set default public.current_tenant_id();
alter table public.job_disciplines alter column tenant_id set default public.current_tenant_id();
alter table public.job_phases alter column tenant_id set default public.current_tenant_id();
alter table public.job_scopes alter column tenant_id set default public.current_tenant_id();
alter table public.job_components alter column tenant_id set default public.current_tenant_id();


-- ---------------------------------------------------------------------------
-- 2. Sequence Generation (ADR 010)
-- ---------------------------------------------------------------------------
-- Provides atomic, concurrency-safe sequential identifiers for operational 
-- records (e.g., Job Numbers, Transmittal Numbers, Issue Numbers).
-- 
-- BEHAVIOUR:
-- - Tenant-scoped: Sequences are strictly isolated per tenant_id.
-- - Year-scoped: Sequences reset to 1 at the start of each year (e.g. 2026-0001)
-- - Atomic: Advisory locks prevent concurrent allocation races.
-- ---------------------------------------------------------------------------
create table public.tenant_sequences (
  tenant_id   uuid        not null default public.current_tenant_id(),
  entity_type text        not null,
  year        int         not null,
  next_value  int         not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  primary key (tenant_id, entity_type, year)
);

create trigger trg_tenant_sequences_updated_at
  before update on public.tenant_sequences
  for each row execute function public.set_updated_at();

-- Function to allocate and return the next formatted sequence number safely
create or replace function public.generate_next_sequence(
  p_tenant_id uuid,
  p_entity_type text,
  p_year int default extract(year from current_date)::int
) returns text as $$
declare
  v_next int;
begin
  -- Tenant-scoped advisory lock prevents concurrent allocation conflicts
  perform pg_advisory_xact_lock(
    hashtext(p_tenant_id::text || p_entity_type || p_year::text)
  );

  insert into public.tenant_sequences (tenant_id, entity_type, year, next_value)
  values (p_tenant_id, p_entity_type, p_year, 2)
  on conflict (tenant_id, entity_type, year)
  do update set next_value = public.tenant_sequences.next_value + 1,
                updated_at = now()
  returning next_value - 1 into v_next;

  -- Returns format: YYYY-NNNN
  return p_year::text || '-' || lpad(v_next::text, 4, '0');
end;
$$ language plpgsql;


-- ---------------------------------------------------------------------------
-- 3. Domain Events (ADR 008)
-- ---------------------------------------------------------------------------
-- Append-only event store for activity feeds, operational analytics, and 
-- audit reconstruction. Deliberately omits FK constraints on entity_id and 
-- actor_id to preserve immutability if referenced entities are deleted.
--
-- APPEND-ONLY DESIGN:
-- - This table is designed as an immutable ledger of operational reality.
-- - Existing rows MUST NOT be updated or deleted.
-- - Only INSERT operations are permitted by application design.
-- ---------------------------------------------------------------------------
create table public.domain_events (
  id          uuid        not null default gen_random_uuid(),
  tenant_id   uuid        not null default public.current_tenant_id(),
  occurred_at timestamptz not null default now(),

  -- event_type must follow namespace.action convention (e.g. 'job.status_changed')
  event_type  text        not null check (event_type ~ '^[a-z_]+\.[a-z_]+$'),
  entity_type text        not null,   -- e.g., 'job', 'staff', 'document'
  entity_id   uuid        not null,   -- UUID of the affected entity
  actor_id    uuid,                   -- UUID of staff who triggered the event (null if system)
  payload     jsonb       not null default '{}'::jsonb,

  -- Composite PK required for partition compatibility
  primary key (id, occurred_at)
) partition by range (occurred_at);

-- Initial partition for the current operational year
create table public.domain_events_2026
  partition of public.domain_events
  for values from ('2026-01-01') to ('2027-01-01');

create index idx_events_tenant_entity on public.domain_events (tenant_id, entity_type, entity_id);
create index idx_events_tenant_type on public.domain_events (tenant_id, event_type, occurred_at desc);
create index idx_events_tenant_actor on public.domain_events (tenant_id, actor_id) where actor_id is not null;

COMMIT;
