-- =============================================================================
-- Plinth � Initial Schema Migration
-- =============================================================================
-- This migration creates the complete foundational schema for Plinth.
-- It concatenates the following source files in order:
--   1. schema/extensions.sql      � PostgreSQL extensions
--   2. schema/01_lookup_tables.sql � Trigger function + lookup tables
--   3. schema/02_core_tables.sql  � Core business tables
--   4. schema/03_indexes.sql      � Non-PK, non-unique indexes
--   5. schema/04_rls_policies.sql � Row Level Security policies
--
-- Source of truth: the individual files in schema/. This migration is a
-- concatenated copy for the Supabase CLI migration runner.
-- =============================================================================


-- =========================================================================
-- SOURCE: schema/extensions.sql
-- =========================================================================

-- =============================================================================
-- Plinth — Required PostgreSQL Extensions
-- =============================================================================
-- citext: case-insensitive text type, used for email columns
-- pgcrypto: provides gen_random_uuid() on PostgreSQL < 13. Included for
--           compatibility; on PostgreSQL 13+ gen_random_uuid() is built-in.
-- =============================================================================

create extension if not exists citext;
create extension if not exists pgcrypto;


-- =========================================================================
-- SOURCE: schema/01_lookup_tables.sql
-- =========================================================================

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


-- =========================================================================
-- SOURCE: schema/02_core_tables.sql
-- =========================================================================

-- =============================================================================
-- Plinth — Core Business Tables
-- =============================================================================
-- These tables model the operational domain: people, clients, and jobs.
-- Creation order matters — each table's foreign keys must resolve against
-- tables defined earlier in this file or in 01_lookup_tables.sql.
--
-- Order: staff → clients → client_contacts → jobs → job_offices →
--        job_disciplines → job_phases → job_scopes → job_components
--
-- AUDIT COLUMNS: Every business table carries created_by and updated_by
-- referencing staff(id). These are nullable ONLY for the bootstrap row
-- (the first staff member has no creator). Application code must enforce
-- non-null audit columns for all subsequent rows.
--
-- MULTI-TENANT NOTE: The tenant_id default of '00000000-...-000000000001'
-- is the bootstrap tenant for the single-tenant phase. This default MUST be
-- removed from every table before going multi-tenant.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- staff
-- ---------------------------------------------------------------------------
-- Represents every person who works at the practice. Self-referential
-- manager_id models the reporting hierarchy.
--
-- auth_user_id links to Supabase auth.users for authentication. It is not
-- a foreign key constraint to avoid coupling DDL to the auth schema, but
-- application code must ensure referential integrity.
-- ---------------------------------------------------------------------------
create table public.staff (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Audit columns: nullable for the bootstrap row only (the first staff
  -- member has no creator). Application code must set these for all
  -- subsequent inserts and updates.
  created_by  uuid references public.staff(id) on delete restrict,
  updated_by  uuid references public.staff(id) on delete restrict,

  email           citext      not null,
  full_name       text        not null,
  preferred_name  text,       -- nullable: not everyone uses a preferred name

  -- staff.role represents the person's seniority/job title at the firm
  -- (HR concept). The assignment of a PD to a specific job is via
  -- jobs.project_director_id and can reference any staff member regardless
  -- of their role value. The two are orthogonal.
  role  text not null check (role in (
    'director',
    'project_director',
    'design_manager',
    'senior_engineer',
    'engineer',
    'graduate',
    'drafter',
    'admin',
    'finance'
  )),

  -- nullable: admin/finance staff may not belong to an engineering discipline
  primary_discipline_id uuid references public.disciplines(id) on delete restrict,
  primary_office_id     uuid not null references public.office_locations(id) on delete restrict,

  -- nullable: admin/finance staff may not have billable rates
  hourly_cost_rate  numeric(10,2) check (hourly_cost_rate > 0),
  hourly_bill_rate  numeric(10,2) check (hourly_bill_rate > 0),

  is_active    boolean not null default true,
  manager_id   uuid references public.staff(id) on delete restrict,  -- nullable: directors have no manager
  auth_user_id uuid,           -- links to Supabase auth.users; not an FK constraint
  signature_url text,          -- nullable: URL to stored signature image

  constraint uq_staff_tenant_email unique (tenant_id, email)
);

create trigger trg_staff_updated_at
  before update on public.staff
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
-- Organisations that commission structural engineering work. Name is not
-- unique — the same organisation name may appear under different tenants.
-- ---------------------------------------------------------------------------
create table public.clients (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.staff(id) on delete restrict,
  updated_by  uuid references public.staff(id) on delete restrict,

  name     text    not null,
  industry text,               -- nullable: not always known at creation
  status   text    not null default 'active'
                   check (status in ('active', 'inactive')),
  website  text,               -- nullable

  -- Structured billing address stored as jsonb for flexibility.
  -- Expected shape: { street, city, region, postcode, country }
  -- nullable: billing address may not be known at client creation
  billing_address jsonb
);

create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- client_contacts
-- ---------------------------------------------------------------------------
-- Individual people at a client organisation. Only one contact per client
-- per tenant may be marked is_primary (enforced by a partial unique index
-- in 03_indexes.sql).
-- ---------------------------------------------------------------------------
create table public.client_contacts (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.staff(id) on delete restrict,
  updated_by  uuid references public.staff(id) on delete restrict,

  client_id   uuid    not null references public.clients(id) on delete restrict,
  full_name   text    not null,
  role        text,             -- nullable: contact's role at the client org
  email       citext  not null,
  phone       text,             -- nullable
  is_primary  boolean not null default false,
  is_active   boolean not null default true
);

create trigger trg_client_contacts_updated_at
  before update on public.client_contacts
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- Helper function: default job status
-- ---------------------------------------------------------------------------
-- Sets status_id to the 'OPEN' status for the job's tenant when no
-- status_id is provided on INSERT. Fires as a BEFORE INSERT trigger so
-- the NOT NULL constraint on status_id is satisfied.
-- ---------------------------------------------------------------------------
create or replace function public.set_default_job_status()
returns trigger as $$
begin
  if new.status_id is null then
    select id into new.status_id
      from public.job_statuses
     where code = 'OPEN'
       and tenant_id = new.tenant_id;

    if new.status_id is null then
      raise exception 'No OPEN status found for tenant %. Ensure job_statuses seed data exists.', new.tenant_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;


-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
-- The central aggregate of the system. Every job is a legally significant
-- engagement to provide structural engineering services.
--
-- job_number format: '2026-0001'. Generation is handled by application code
-- or a future database function — not by a DEFAULT expression.
--
-- RISK RULE: When fee_value > project_risk_value, the application must
-- prompt the user for confirmation before saving. This is NOT enforced as
-- a database constraint because the business requires the ability to save
-- with an acknowledged override.
-- ---------------------------------------------------------------------------
create table public.jobs (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.staff(id) on delete restrict,
  updated_by  uuid references public.staff(id) on delete restrict,

  job_number  text    not null,
  name        text    not null,
  client_id   uuid    not null references public.clients(id) on delete restrict,
  job_type_id uuid    not null references public.job_types(id) on delete restrict,
  -- status_id defaults to 'OPEN' via the set_default_job_status trigger
  status_id   uuid    not null references public.job_statuses(id) on delete restrict,
  risk_tier_id uuid   not null references public.risk_tiers(id) on delete restrict,

  project_director_id uuid not null references public.staff(id) on delete restrict,
  design_manager_id   uuid          references public.staff(id) on delete restrict,  -- nullable: not all jobs have a DM

  primary_office_id uuid not null references public.office_locations(id) on delete restrict,

  -- Structured site address stored as jsonb for flexibility.
  -- Expected shape: { street, suburb, city, region, postcode, country }
  site_address jsonb,          -- nullable: site may not be known at job creation

  lot_number  text,            -- nullable: NZ legal lot reference
  dp_number   text,            -- nullable: NZ deposited plan reference

  -- RISK RULE: When fee_value > project_risk_value, application code must
  -- prompt the user for confirmation. This is a business rule, not a
  -- database constraint, because saves-with-override must be permitted.
  fee_value          numeric(12,2) not null default 0 check (fee_value >= 0),
  project_risk_value numeric(12,2) not null default 0 check (project_risk_value >= 0),

  opened_date            date not null default current_date,
  target_completion_date date,          -- nullable
  actual_completion_date date,          -- nullable

  description text,            -- nullable: free-text job description

  constraint uq_jobs_tenant_job_number unique (tenant_id, job_number)
);

create trigger trg_jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

create trigger trg_jobs_default_status
  before insert on public.jobs
  for each row execute function public.set_default_job_status();


-- ---------------------------------------------------------------------------
-- job_offices (junction table)
-- ---------------------------------------------------------------------------
-- Links jobs to office locations. A job may span multiple offices.
-- on delete cascade: the join row has no independent meaning.
-- No created_by / updated_by: junction rows are not independently audited.
-- ---------------------------------------------------------------------------
create table public.job_offices (
  -- No surrogate id — composite PK
  job_id             uuid not null references public.jobs(id) on delete cascade,
  office_location_id uuid not null references public.office_locations(id) on delete cascade,
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  is_primary  boolean not null default false,

  primary key (job_id, office_location_id)
);

create trigger trg_job_offices_updated_at
  before update on public.job_offices
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- job_disciplines (junction table)
-- ---------------------------------------------------------------------------
-- Links jobs to engineering disciplines involved. A complex job may require
-- structural, geotechnical, and fire engineering simultaneously.
-- on delete cascade: the join row has no independent meaning.
-- No created_by / updated_by: junction rows are not independently audited.
-- ---------------------------------------------------------------------------
create table public.job_disciplines (
  -- No surrogate id — composite PK
  job_id        uuid not null references public.jobs(id) on delete cascade,
  discipline_id uuid not null references public.disciplines(id) on delete cascade,
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  primary key (job_id, discipline_id)
);

create trigger trg_job_disciplines_updated_at
  before update on public.job_disciplines
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- job_phases
-- ---------------------------------------------------------------------------
-- Breaks a job into sequential phases of work (Concept → Developed Design →
-- Detailed Design → Construction → Closeout). Each phase has its own fee
-- allocation and hour estimate.
--
-- NOTE: actual_hours and variance_hours are NOT modelled here. They belong
-- in the Time Entry module (future) where actual_hours will be derived from
-- time_entries via a database view, not stored as a column.
-- ---------------------------------------------------------------------------
create table public.job_phases (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.staff(id) on delete restrict,
  updated_by  uuid references public.staff(id) on delete restrict,

  job_id           uuid         not null references public.jobs(id) on delete restrict,
  name             text         not null,
  sort_order       int          not null,
  estimated_hours  numeric(8,2) not null default 0 check (estimated_hours >= 0),
  fee_amount       numeric(12,2) not null default 0 check (fee_amount >= 0),
  status           text         not null default 'not_started'
                   check (status in ('not_started', 'in_progress', 'completed', 'on_hold')),
  planned_start_date date,      -- nullable
  planned_end_date   date       -- nullable
);

create trigger trg_job_phases_updated_at
  before update on public.job_phases
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- job_scopes
-- ---------------------------------------------------------------------------
-- Scope items within a phase. Each describes a deliverable or work package.
-- is_included allows tracking exclusions explicitly in fee proposals.
-- ---------------------------------------------------------------------------
create table public.job_scopes (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.staff(id) on delete restrict,
  updated_by  uuid references public.staff(id) on delete restrict,

  -- cascade: scopes have no meaning without their phase. UI must not expose
  -- direct phase deletion; phases should be cancelled via status change.
  -- Cascade is a cleanup safety net, not an invitation.
  phase_id     uuid    not null references public.job_phases(id) on delete cascade,
  name         text    not null,
  description  text,            -- nullable
  sort_order   int     not null,
  is_included  boolean not null default true
);

create trigger trg_job_scopes_updated_at
  before update on public.job_scopes
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- job_components
-- ---------------------------------------------------------------------------
-- Granular components within a scope item. Each represents a discrete piece
-- of engineering work that can be estimated and tracked independently.
-- ---------------------------------------------------------------------------
create table public.job_components (
  id          uuid        primary key default gen_random_uuid(),
  -- MULTI-TENANT: Remove this default before multi-tenant launch
  tenant_id   uuid        not null default '00000000-0000-0000-0000-000000000001'::uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references public.staff(id) on delete restrict,
  updated_by  uuid references public.staff(id) on delete restrict,

  -- cascade: components have no meaning without their scope. UI must not
  -- expose direct scope deletion; cascade is a cleanup safety net.
  scope_id        uuid         not null references public.job_scopes(id) on delete cascade,
  name            text         not null,
  description     text,        -- nullable
  estimated_hours numeric(8,2) not null default 0 check (estimated_hours >= 0),
  sort_order      int          not null,
  is_billable     boolean      not null default true
);

create trigger trg_job_components_updated_at
  before update on public.job_components
  for each row execute function public.set_updated_at();


-- =========================================================================
-- SOURCE: schema/03_indexes.sql
-- =========================================================================

-- =============================================================================
-- Plinth — Indexes
-- =============================================================================
-- Non-PK, non-unique-constraint indexes. PostgreSQL does NOT auto-create
-- indexes on foreign key columns — every FK needs an explicit index for
-- efficient joins and cascading deletes.
--
-- Indexes are grouped by table, with a comment on each explaining the
-- query pattern it serves.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- staff
-- ---------------------------------------------------------------------------

-- FK index: look up staff by discipline (e.g. "all structural engineers")
create index idx_staff_primary_discipline on public.staff (primary_discipline_id);

-- FK index: look up staff by office (e.g. "all Auckland staff")
create index idx_staff_primary_office on public.staff (primary_office_id);

-- FK index: look up staff by manager (e.g. "direct reports for manager X")
create index idx_staff_manager on public.staff (manager_id);

-- FK index: audit trail — who created this staff record
create index idx_staff_created_by on public.staff (created_by);

-- FK index: audit trail — who last updated this staff record
create index idx_staff_updated_by on public.staff (updated_by);

-- Login lookup: find staff by email without knowing tenant_id.
-- The unique constraint on (tenant_id, email) cannot serve email-only
-- queries because tenant_id is the leading column. This standalone index
-- supports the authentication flow where email is provided first.
create index idx_staff_email on public.staff (email);

-- Auth user lookup: resolve Supabase auth.users.id to staff record
create index idx_staff_auth_user on public.staff (auth_user_id)
  where auth_user_id is not null;


-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------

-- RLS and tenant filtering: clients has no unique constraint with tenant_id
-- as a leading column, so we need a standalone index for RLS performance.
create index idx_clients_tenant on public.clients (tenant_id);

-- FK index: audit trail
create index idx_clients_created_by on public.clients (created_by);
create index idx_clients_updated_by on public.clients (updated_by);


-- ---------------------------------------------------------------------------
-- client_contacts
-- ---------------------------------------------------------------------------

-- RLS and tenant filtering
create index idx_client_contacts_tenant on public.client_contacts (tenant_id);

-- FK index: look up contacts for a client
create index idx_client_contacts_client on public.client_contacts (client_id);

-- FK index: audit trail
create index idx_client_contacts_created_by on public.client_contacts (created_by);
create index idx_client_contacts_updated_by on public.client_contacts (updated_by);

-- Partial unique index: at most one primary contact per client per tenant.
-- This cannot be expressed as a table-level UNIQUE constraint because it
-- is conditional on is_primary = true.
create unique index idx_client_contacts_one_primary
  on public.client_contacts (tenant_id, client_id)
  where is_primary = true;


-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------

-- The most common query: "list open jobs for this tenant".
-- Composite index serves both tenant-only and tenant+status filters.
create index idx_jobs_tenant_status on public.jobs (tenant_id, status_id);

-- FK index: list jobs for a client
create index idx_jobs_client on public.jobs (client_id);

-- FK index: list jobs by type
create index idx_jobs_job_type on public.jobs (job_type_id);

-- FK index: list jobs by risk tier
create index idx_jobs_risk_tier on public.jobs (risk_tier_id);

-- FK index: list jobs where a specific person is project director
create index idx_jobs_project_director on public.jobs (project_director_id);

-- FK index: list jobs where a specific person is design manager
create index idx_jobs_design_manager on public.jobs (design_manager_id)
  where design_manager_id is not null;

-- FK index: list jobs by primary office
create index idx_jobs_primary_office on public.jobs (primary_office_id);

-- FK index: audit trail
create index idx_jobs_created_by on public.jobs (created_by);
create index idx_jobs_updated_by on public.jobs (updated_by);


-- ---------------------------------------------------------------------------
-- job_offices (junction)
-- ---------------------------------------------------------------------------

-- RLS tenant filtering
create index idx_job_offices_tenant on public.job_offices (tenant_id);

-- FK index: the composite PK (job_id, office_location_id) covers job_id
-- lookups, but office_location_id needs its own index for "which jobs use
-- this office?" queries and cascade delete performance.
create index idx_job_offices_office on public.job_offices (office_location_id);


-- ---------------------------------------------------------------------------
-- job_disciplines (junction)
-- ---------------------------------------------------------------------------

-- RLS tenant filtering
create index idx_job_disciplines_tenant on public.job_disciplines (tenant_id);

-- FK index: "which jobs involve this discipline?" queries
create index idx_job_disciplines_discipline on public.job_disciplines (discipline_id);


-- ---------------------------------------------------------------------------
-- job_phases
-- ---------------------------------------------------------------------------

-- RLS tenant filtering
create index idx_job_phases_tenant on public.job_phases (tenant_id);

-- FK index: list phases for a job (the most common access pattern)
create index idx_job_phases_job on public.job_phases (job_id);

-- FK index: audit trail
create index idx_job_phases_created_by on public.job_phases (created_by);
create index idx_job_phases_updated_by on public.job_phases (updated_by);


-- ---------------------------------------------------------------------------
-- job_scopes
-- ---------------------------------------------------------------------------

-- RLS tenant filtering
create index idx_job_scopes_tenant on public.job_scopes (tenant_id);

-- FK index: list scopes for a phase
create index idx_job_scopes_phase on public.job_scopes (phase_id);

-- FK index: audit trail
create index idx_job_scopes_created_by on public.job_scopes (created_by);
create index idx_job_scopes_updated_by on public.job_scopes (updated_by);


-- ---------------------------------------------------------------------------
-- job_components
-- ---------------------------------------------------------------------------

-- RLS tenant filtering
create index idx_job_components_tenant on public.job_components (tenant_id);

-- FK index: list components for a scope
create index idx_job_components_scope on public.job_components (scope_id);

-- FK index: audit trail
create index idx_job_components_created_by on public.job_components (created_by);
create index idx_job_components_updated_by on public.job_components (updated_by);


-- =========================================================================
-- SOURCE: schema/04_rls_policies.sql
-- =========================================================================

-- =============================================================================
-- Plinth — Row Level Security Policies
-- =============================================================================
-- TENANT ISOLATION via RLS
--
-- Every table has RLS enabled with four named policies:
--   {table}_tenant_select  — SELECT
--   {table}_tenant_insert  — INSERT (WITH CHECK)
--   {table}_tenant_update  — UPDATE (USING + WITH CHECK)
--   {table}_tenant_delete  — DELETE (USING)
--
-- POLICY EXPRESSION (same for all):
--   tenant_id = coalesce(
--     (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
--     '00000000-0000-0000-0000-000000000001'::uuid
--   )
--
-- FALLBACK BEHAVIOUR:
-- When no JWT claim is present (e.g. service role calls from Edge Functions
-- or direct psql sessions during development), the coalesce falls back to
-- the bootstrap tenant UUID. This ensures the system works in single-tenant
-- mode without requiring every call to carry a JWT.
--
-- !! MULTI-TENANT LAUNCH REQUIREMENT !!
-- Before going multi-tenant, this fallback MUST be removed. Replace the
-- coalesce expression with a strict check:
--   tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
-- Failing to do so would give unauthenticated requests access to the
-- bootstrap tenant's data.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- tenants
-- ---------------------------------------------------------------------------
alter table public.tenants enable row level security;

create policy tenants_tenant_select on public.tenants
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy tenants_tenant_insert on public.tenants
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy tenants_tenant_update on public.tenants
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy tenants_tenant_delete on public.tenants
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_statuses
-- ---------------------------------------------------------------------------
alter table public.job_statuses enable row level security;

create policy job_statuses_tenant_select on public.job_statuses
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_statuses_tenant_insert on public.job_statuses
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_statuses_tenant_update on public.job_statuses
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_statuses_tenant_delete on public.job_statuses
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_types
-- ---------------------------------------------------------------------------
alter table public.job_types enable row level security;

create policy job_types_tenant_select on public.job_types
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_types_tenant_insert on public.job_types
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_types_tenant_update on public.job_types
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_types_tenant_delete on public.job_types
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- risk_tiers
-- ---------------------------------------------------------------------------
alter table public.risk_tiers enable row level security;

create policy risk_tiers_tenant_select on public.risk_tiers
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy risk_tiers_tenant_insert on public.risk_tiers
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy risk_tiers_tenant_update on public.risk_tiers
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy risk_tiers_tenant_delete on public.risk_tiers
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- disciplines
-- ---------------------------------------------------------------------------
alter table public.disciplines enable row level security;

create policy disciplines_tenant_select on public.disciplines
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy disciplines_tenant_insert on public.disciplines
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy disciplines_tenant_update on public.disciplines
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy disciplines_tenant_delete on public.disciplines
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- office_locations
-- ---------------------------------------------------------------------------
alter table public.office_locations enable row level security;

create policy office_locations_tenant_select on public.office_locations
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy office_locations_tenant_insert on public.office_locations
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy office_locations_tenant_update on public.office_locations
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy office_locations_tenant_delete on public.office_locations
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- staff
-- ---------------------------------------------------------------------------
alter table public.staff enable row level security;

create policy staff_tenant_select on public.staff
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy staff_tenant_insert on public.staff
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy staff_tenant_update on public.staff
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy staff_tenant_delete on public.staff
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
alter table public.clients enable row level security;

create policy clients_tenant_select on public.clients
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy clients_tenant_insert on public.clients
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy clients_tenant_update on public.clients
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy clients_tenant_delete on public.clients
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- client_contacts
-- ---------------------------------------------------------------------------
alter table public.client_contacts enable row level security;

create policy client_contacts_tenant_select on public.client_contacts
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy client_contacts_tenant_insert on public.client_contacts
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy client_contacts_tenant_update on public.client_contacts
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy client_contacts_tenant_delete on public.client_contacts
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
alter table public.jobs enable row level security;

create policy jobs_tenant_select on public.jobs
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy jobs_tenant_insert on public.jobs
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy jobs_tenant_update on public.jobs
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy jobs_tenant_delete on public.jobs
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_offices
-- ---------------------------------------------------------------------------
alter table public.job_offices enable row level security;

create policy job_offices_tenant_select on public.job_offices
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_offices_tenant_insert on public.job_offices
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_offices_tenant_update on public.job_offices
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_offices_tenant_delete on public.job_offices
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_disciplines
-- ---------------------------------------------------------------------------
alter table public.job_disciplines enable row level security;

create policy job_disciplines_tenant_select on public.job_disciplines
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_disciplines_tenant_insert on public.job_disciplines
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_disciplines_tenant_update on public.job_disciplines
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_disciplines_tenant_delete on public.job_disciplines
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_phases
-- ---------------------------------------------------------------------------
alter table public.job_phases enable row level security;

create policy job_phases_tenant_select on public.job_phases
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_phases_tenant_insert on public.job_phases
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_phases_tenant_update on public.job_phases
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_phases_tenant_delete on public.job_phases
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_scopes
-- ---------------------------------------------------------------------------
alter table public.job_scopes enable row level security;

create policy job_scopes_tenant_select on public.job_scopes
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_scopes_tenant_insert on public.job_scopes
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_scopes_tenant_update on public.job_scopes
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_scopes_tenant_delete on public.job_scopes
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_components
-- ---------------------------------------------------------------------------
alter table public.job_components enable row level security;

create policy job_components_tenant_select on public.job_components
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_components_tenant_insert on public.job_components
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_components_tenant_update on public.job_components
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_components_tenant_delete on public.job_components
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- =============================================================================
-- GRANTS
-- Expose tables to PostgREST for authenticated users and service_role
-- =============================================================================
grant select, insert, update, delete on public.tenants to authenticated;
grant select, insert, update, delete on public.tenants to service_role;
grant select, insert, update, delete on public.job_statuses to authenticated;
grant select, insert, update, delete on public.job_statuses to service_role;
grant select, insert, update, delete on public.job_types to authenticated;
grant select, insert, update, delete on public.job_types to service_role;
grant select, insert, update, delete on public.risk_tiers to authenticated;
grant select, insert, update, delete on public.risk_tiers to service_role;
grant select, insert, update, delete on public.disciplines to authenticated;
grant select, insert, update, delete on public.disciplines to service_role;
grant select, insert, update, delete on public.office_locations to authenticated;
grant select, insert, update, delete on public.office_locations to service_role;
grant select, insert, update, delete on public.staff to authenticated;
grant select, insert, update, delete on public.staff to service_role;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.clients to service_role;
grant select, insert, update, delete on public.client_contacts to authenticated;
grant select, insert, update, delete on public.client_contacts to service_role;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.jobs to service_role;
grant select, insert, update, delete on public.job_offices to authenticated;
grant select, insert, update, delete on public.job_offices to service_role;
grant select, insert, update, delete on public.job_disciplines to authenticated;
grant select, insert, update, delete on public.job_disciplines to service_role;
grant select, insert, update, delete on public.job_phases to authenticated;
grant select, insert, update, delete on public.job_phases to service_role;
grant select, insert, update, delete on public.job_scopes to authenticated;
grant select, insert, update, delete on public.job_scopes to service_role;
grant select, insert, update, delete on public.job_components to authenticated;
grant select, insert, update, delete on public.job_components to service_role;

