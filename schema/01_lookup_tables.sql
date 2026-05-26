-- =============================================================================
-- Plinth — Lookup Tables
-- =============================================================================
-- These tables define reference data that may evolve per tenant. They are
-- created before core tables because core tables hold foreign keys to them.
--
-- Every table follows the universal column contract:
--   id, tenant_id, created_at, updated_at
--
-- Lookup tables do NOT carry created_by / updated_by because they are
-- system-managed reference data, not user-generated business records.
--
-- MULTI-TENANT NOTE: The tenant_id default of '00000000-...-000000000001'
-- is the bootstrap tenant for the single-tenant phase. This default MUST be
-- removed from every table before going multi-tenant.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Reusable trigger function: auto-update updated_at on every UPDATE
-- ---------------------------------------------------------------------------
-- Attached to every table via a BEFORE UPDATE trigger. Do NOT rely on
-- DEFAULT now() for updates — defaults only fire on INSERT.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ---------------------------------------------------------------------------
-- tenants
-- ---------------------------------------------------------------------------
-- The root entity for multi-tenant isolation. In the single-tenant phase
-- only one row exists: the bootstrap tenant (Kirk Roberts Consulting).
--
-- The self-reference constraint (tenant_id = id) prevents the absurd case
-- of one tenant "owning" another tenant's record. New tenant creation must
-- explicitly set both id and tenant_id to the same value.
-- ---------------------------------------------------------------------------
create table public.tenants (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- No created_by / updated_by — tenants are created by system admin
  name          text    not null,
  slug          text    not null unique,
  country_code  text    not null check (country_code in ('NZ', 'AU', 'UK')),
  timezone      text    not null default 'Pacific/Auckland',
  currency_code text    not null default 'NZD'
                        check (currency_code in ('NZD', 'AUD', 'GBP')),
  active        boolean not null default true,

  -- Self-reference integrity: a tenant's tenant_id must equal its own id
  constraint tenants_self_reference check (tenant_id = id)
);

create trigger trg_tenants_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- job_statuses
-- ---------------------------------------------------------------------------
-- Tracks the lifecycle of a job. is_terminal indicates statuses where no
-- further work is expected (Closed, Cancelled).
-- ---------------------------------------------------------------------------
create table public.job_statuses (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  code        text    not null,
  name        text    not null,
  description text,           -- nullable: not all statuses need a description
  is_terminal boolean not null default false,
  sort_order  int     not null,
  active      boolean not null default true,

  constraint uq_job_statuses_tenant_code unique (tenant_id, code)
);

create trigger trg_job_statuses_updated_at
  before update on public.job_statuses
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- job_types
-- ---------------------------------------------------------------------------
-- Classifies the nature of work: Residential, Commercial, etc.
-- ---------------------------------------------------------------------------
create table public.job_types (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  code        text    not null,
  name        text    not null,
  description text,           -- nullable
  sort_order  int     not null,
  active      boolean not null default true,

  constraint uq_job_types_tenant_code unique (tenant_id, code)
);

create trigger trg_job_types_updated_at
  before update on public.job_types
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- risk_tiers
-- ---------------------------------------------------------------------------
-- Risk classification A (highest) through D (lowest). Determines sign-off
-- requirements and fee thresholds. Used by the application to flag jobs
-- where fee_value exceeds project_risk_value.
-- ---------------------------------------------------------------------------
create table public.risk_tiers (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  code        text    not null,
  name        text    not null,
  description text,           -- nullable

  -- Fee thresholds define the fee band for this risk tier
  -- min_fee_value is always positive; max_fee_value is null for the top tier
  min_fee_value  numeric(12,2) not null check (min_fee_value > 0),
  max_fee_value  numeric(12,2)          check (max_fee_value > 0),
  -- Ensure max > min when both are present
  constraint risk_tiers_fee_range check (
    max_fee_value is null or max_fee_value > min_fee_value
  ),

  -- Governance flags
  requires_director_signoff    boolean not null default false,
  requires_peer_review         boolean not null default false,
  requires_pi_insurance_check  boolean not null default false,

  sort_order  int     not null,
  active      boolean not null default true,

  constraint uq_risk_tiers_tenant_code unique (tenant_id, code)
);

create trigger trg_risk_tiers_updated_at
  before update on public.risk_tiers
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- disciplines
-- ---------------------------------------------------------------------------
-- Engineering disciplines offered by the practice. requires_cpeng indicates
-- whether Chartered Professional Engineer status is required for sign-off
-- in this discipline (NZ regulatory requirement).
-- ---------------------------------------------------------------------------
create table public.disciplines (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  code               text          not null,
  name               text          not null,
  description        text,         -- nullable
  requires_cpeng     boolean       not null default false,
  default_hourly_rate numeric(10,2) not null check (default_hourly_rate > 0),
  sort_order         int           not null,
  active             boolean       not null default true,

  constraint uq_disciplines_tenant_code unique (tenant_id, code)
);

create trigger trg_disciplines_updated_at
  before update on public.disciplines
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- office_locations
-- ---------------------------------------------------------------------------
-- Physical offices where work is performed. Each has a country and timezone
-- for localising dates/times in documents and reports.
-- ---------------------------------------------------------------------------
create table public.office_locations (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  code         text    not null,
  name         text    not null,
  description  text,           -- nullable
  country_code text    not null check (country_code in ('NZ', 'AU', 'UK')),
  timezone     text    not null,
  sort_order   int     not null,
  active       boolean not null default true,

  constraint uq_office_locations_tenant_code unique (tenant_id, code)
);

create trigger trg_office_locations_updated_at
  before update on public.office_locations
  for each row execute function public.set_updated_at();
