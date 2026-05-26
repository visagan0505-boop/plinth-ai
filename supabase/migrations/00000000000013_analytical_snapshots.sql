-- =============================================================================
-- Plinth - Migration: 00000000000013_analytical_snapshots
-- =============================================================================
-- Phase 5B: Intelligence Infrastructure
--
-- Introduces the read-only analytical snapshot tables for job profitability 
-- and staff utilisation to support deterministic forecasting.
-- =============================================================================

BEGIN;

CREATE TABLE public.job_analytical_snapshots (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null default public.current_tenant_id(),
  created_at   timestamptz not null default now(),
  
  job_id       uuid        not null references public.jobs(id) on delete cascade,
  temporal_date date       not null,
  
  -- Flattened Aggregations
  total_approved_hours numeric(10,2) not null default 0,
  unbilled_wip_value   numeric(12,2) not null default 0,
  realized_revenue     numeric(12,2) not null default 0,
  total_operational_cost numeric(12,2) not null default 0,
  profit_margin_value  numeric(12,2) not null default 0,
  profit_margin_percentage numeric(5,2) not null default 0,
  
  constraint job_analytical_snapshots_unique_date unique(tenant_id, job_id, temporal_date)
);

CREATE INDEX idx_job_snapshots_tenant_job ON public.job_analytical_snapshots(tenant_id, job_id);
CREATE INDEX idx_job_snapshots_temporal ON public.job_analytical_snapshots(temporal_date);

CREATE TABLE public.staff_analytical_snapshots (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null default public.current_tenant_id(),
  created_at   timestamptz not null default now(),
  
  staff_id     uuid        not null references public.staff(id) on delete cascade,
  temporal_date date       not null,
  
  -- Flattened Aggregations
  total_billable_hours numeric(10,2) not null default 0,
  total_internal_hours numeric(10,2) not null default 0,
  contracted_hours     numeric(10,2) not null default 0,
  utilisation_percentage numeric(5,2) not null default 0,
  
  constraint staff_analytical_snapshots_unique_date unique(tenant_id, staff_id, temporal_date)
);

CREATE INDEX idx_staff_snapshots_tenant_staff ON public.staff_analytical_snapshots(tenant_id, staff_id);
CREATE INDEX idx_staff_snapshots_temporal ON public.staff_analytical_snapshots(temporal_date);

COMMIT;
