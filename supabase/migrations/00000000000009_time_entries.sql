-- =============================================================================
-- Plinth - Migration: 00000000000009_time_entries
-- =============================================================================
-- Phase 3E: Time Entry Workflow
--
-- Introduces the immutable time entry ledger.
-- =============================================================================

BEGIN;

CREATE TABLE public.time_entries (
  id          uuid        primary key default gen_random_uuid(),
  tenant_id   uuid        not null default public.current_tenant_id(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid        not null references public.staff(id) on delete restrict,
  updated_by  uuid        not null references public.staff(id) on delete restrict,

  staff_id    uuid        not null references public.staff(id) on delete restrict,
  job_id      uuid        not null references public.jobs(id) on delete restrict,
  -- Optional linkage to a specific phase, but job_id is always mandatory
  job_phase_id uuid       references public.job_phases(id) on delete restrict,

  operational_date date   not null,
  hours            numeric(5,2) not null check (hours != 0), -- allow negative for contra-entries
  notes            text,

  -- Historical rate snapshot at time of entry
  snapshot_cost_rate numeric(10,2) not null check (snapshot_cost_rate >= 0),
  snapshot_bill_rate numeric(10,2) not null check (snapshot_bill_rate >= 0),
  
  is_billable      boolean not null default true,

  -- Lifecycle State
  status text not null default 'DRAFT' check (status in ('DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED')),
  
  approved_by uuid references public.staff(id) on delete restrict,
  approved_at timestamptz
);

CREATE TRIGGER trg_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes for fast aggregate queries
CREATE INDEX idx_time_entries_tenant_job ON public.time_entries(tenant_id, job_id);
CREATE INDEX idx_time_entries_tenant_staff ON public.time_entries(tenant_id, staff_id, operational_date);

COMMIT;
