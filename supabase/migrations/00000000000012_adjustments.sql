-- =============================================================================
-- Plinth - Migration: 00000000000012_adjustments
-- =============================================================================
-- Phase 4A: Financial Operations
--
-- Introduces the append-only adjustment ledger.
-- =============================================================================

BEGIN;

CREATE TABLE public.adjustments (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null default public.current_tenant_id(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid        not null references public.staff(id) on delete restrict,
  updated_by   uuid        not null references public.staff(id) on delete restrict,

  job_id       uuid        not null references public.jobs(id) on delete restrict,
  
  adjustment_type text not null check (adjustment_type in ('CREDIT_NOTE', 'WIP_WRITEOFF')),
  
  -- The entity being adjusted
  reference_invoice_id uuid references public.invoices(id) on delete restrict,
  reference_time_entry_id uuid references public.time_entries(id) on delete restrict,
  
  amount       numeric(12,2) not null, -- Can be negative or positive depending on type
  operational_date date not null,
  
  notes        text not null
);

CREATE TRIGGER trg_adjustments_updated_at
  BEFORE UPDATE ON public.adjustments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_adjustments_tenant_job ON public.adjustments(tenant_id, job_id);

COMMIT;
