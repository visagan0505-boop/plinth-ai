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
