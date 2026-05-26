-- =============================================================================
-- Plinth - Migration: 00000000000010_invoices
-- =============================================================================
-- Phase 4A: Financial Operations
--
-- Introduces the immutable invoices and line items ledger.
-- =============================================================================

BEGIN;

CREATE TABLE public.invoices (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null default public.current_tenant_id(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid        not null references public.staff(id) on delete restrict,
  updated_by   uuid        not null references public.staff(id) on delete restrict,

  job_id       uuid        not null references public.jobs(id) on delete restrict,
  
  -- Invoice Numbering (immutable once issued)
  invoice_number text,
  
  status text not null default 'DRAFT' check (status in ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED')),
  
  -- Financials
  subtotal     numeric(12,2) not null default 0,
  tax_total    numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  
  issued_at    timestamptz,
  due_date     date,
  paid_at      timestamptz,
  
  notes        text,

  constraint invoices_number_unique unique(tenant_id, invoice_number)
);

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_invoices_tenant_job ON public.invoices(tenant_id, job_id);
CREATE INDEX idx_invoices_tenant_status ON public.invoices(tenant_id, status);

-- Line Items
CREATE TABLE public.invoice_line_items (
  id           uuid        primary key default gen_random_uuid(),
  tenant_id    uuid        not null default public.current_tenant_id(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  
  invoice_id   uuid        not null references public.invoices(id) on delete cascade,
  job_phase_id uuid        references public.job_phases(id) on delete restrict,
  
  description  text        not null,
  quantity     numeric(10,2) not null default 1,
  unit_price   numeric(12,2) not null default 0,
  amount       numeric(12,2) not null default 0
);

CREATE TRIGGER trg_invoice_line_items_updated_at
  BEFORE UPDATE ON public.invoice_line_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_invoice_line_items_invoice ON public.invoice_line_items(invoice_id);

-- Link Time Entries to Invoices
ALTER TABLE public.time_entries ADD COLUMN linked_invoice_id uuid references public.invoices(id) on delete restrict;

COMMIT;
