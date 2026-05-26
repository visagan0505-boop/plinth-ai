-- =============================================================================
-- Plinth - Migration: 00000000000005_intelligence_tables
-- =============================================================================
-- Phase 1: Foundational Hardening
--
-- 1. `staff_rate_periods`: Solves ADR 006 (Temporal Financial Modelling) by 
--    enabling historical tracking of cost and bill rates for each staff member.
--    Protected by a GiST exclusion constraint to prevent overlapping periods.
-- 2. `time_entries`: Establishes foundational operational telemetry for 
--    utilization, billability, and future profitability calculations.
--
-- Note: Designed strictly as an operational record. Approval workflows, 
-- payroll calculations, and billing engines are explicitly omitted.
-- =============================================================================

BEGIN;

-- Required for GiST exclusion constraints on standard data types (uuid)
create extension if not exists btree_gist;


-- ---------------------------------------------------------------------------
-- 1. Temporal Financial Modelling (ADR 006)
-- ---------------------------------------------------------------------------
-- HISTORICAL RATE PRESERVATION PHILOSOPHY:
-- Maintains an append-only historical record of staff rates. This ensures 
-- that a profitability query run 3 years from now will use the exact cost 
-- and bill rates that were active on the day the time was logged, rather
-- than retroactively changing historical margins when a user gets a raise.
-- ---------------------------------------------------------------------------
create table public.staff_rate_periods (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null default public.current_tenant_id(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid        not null,
  updated_by      uuid,

  staff_id        uuid        not null,
  effective_from  date        not null,
  effective_to    date,           -- null = current/open-ended period

  hourly_cost_rate numeric(10,2) not null check (hourly_cost_rate > 0),
  hourly_bill_rate numeric(10,2) not null check (hourly_bill_rate > 0),
  notes           text,

  constraint uq_srp_tid_id unique (tenant_id, id),
  
  -- Composite FKs preserving tenant isolation
  constraint fk_srp_staff foreign key (tenant_id, staff_id) references public.staff(tenant_id, id) on delete restrict,
  constraint fk_srp_created_by foreign key (tenant_id, created_by) references public.staff(tenant_id, id) on delete restrict,
  constraint fk_srp_updated_by foreign key (tenant_id, updated_by) references public.staff(tenant_id, id) on delete restrict,

  -- Prevents a staff member from having two active rates on the same day.
  -- coalesce(..., 'infinity') handles the open-ended `effective_to = null`.
  constraint staff_rate_periods_no_overlap
    exclude using gist (
      tenant_id with =,
      staff_id with =,
      daterange(effective_from, coalesce(effective_to, 'infinity'::date), '[)') with &&
    )
);

create trigger trg_staff_rate_periods_updated_at
  before update on public.staff_rate_periods
  for each row execute function public.set_updated_at();

-- Indexes for efficient historical point-in-time lookups
create index idx_srp_tenant on public.staff_rate_periods (tenant_id);
create index idx_srp_staff on public.staff_rate_periods (staff_id);
create index idx_srp_staff_date on public.staff_rate_periods (staff_id, effective_from);


-- ---------------------------------------------------------------------------
-- 2. Time Intelligence Foundations
-- ---------------------------------------------------------------------------
-- OPERATIONAL TELEMETRY INFRASTRUCTURE:
-- Pure operational telemetry log. Records who worked on what, when, and for 
-- how long. By explicitly separating this from billing/payroll state machines, 
-- the schema remains highly adaptable to future analytical (OLAP) workflows,
-- ML forecasting, and capacity planning without entanglement.
-- ---------------------------------------------------------------------------
create table public.time_entries (
  id          uuid        primary key default gen_random_uuid(),
  tenant_id   uuid        not null default public.current_tenant_id(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid        not null,
  updated_by  uuid,

  staff_id     uuid    not null,
  job_id       uuid    not null,
  phase_id     uuid,              -- nullable (job-level overhead)
  component_id uuid,              -- nullable (phase-level overhead)
  
  entry_date   date    not null,
  hours        numeric(5,2) not null check (hours > 0 and hours <= 24),
  is_billable  boolean not null default true,
  description  text,

  constraint uq_te_tid_id unique (tenant_id, id),
  
  -- Composite FKs preserving tenant isolation
  constraint fk_te_staff       foreign key (tenant_id, staff_id) references public.staff(tenant_id, id) on delete restrict,
  constraint fk_te_job         foreign key (tenant_id, job_id) references public.jobs(tenant_id, id) on delete restrict,
  constraint fk_te_phase       foreign key (tenant_id, phase_id) references public.job_phases(tenant_id, id) on delete restrict,
  constraint fk_te_component   foreign key (tenant_id, component_id) references public.job_components(tenant_id, id) on delete restrict,
  constraint fk_te_created_by  foreign key (tenant_id, created_by) references public.staff(tenant_id, id) on delete restrict,
  constraint fk_te_updated_by  foreign key (tenant_id, updated_by) references public.staff(tenant_id, id) on delete restrict
);

create trigger trg_time_entries_updated_at
  before update on public.time_entries
  for each row execute function public.set_updated_at();

-- Core analytical access patterns
create index idx_te_tenant on public.time_entries (tenant_id);
create index idx_te_staff_date on public.time_entries (staff_id, entry_date);
create index idx_te_job on public.time_entries (job_id);
create index idx_te_phase on public.time_entries (phase_id) where phase_id is not null;
create index idx_te_entry_date on public.time_entries (tenant_id, entry_date);

COMMIT;
