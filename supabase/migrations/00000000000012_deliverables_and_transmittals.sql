-- =============================================================================
-- Plinth - Migration: 00000000000012_deliverables_and_transmittals
-- =============================================================================
-- Phase 3F: Engineering Operational Records
--
-- Introduces the strict issue-control schema for deliverables, revisions,
-- and transmittals.
-- =============================================================================

BEGIN;

-- 1. Deliverables
CREATE TABLE public.deliverables (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null default public.current_tenant_id(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid        not null references public.staff(id) on delete restrict,
  updated_by      uuid        not null references public.staff(id) on delete restrict,

  job_id          uuid        not null references public.jobs(id) on delete restrict,
  job_phase_id    uuid        references public.job_phases(id) on delete restrict,
  scope_id        uuid        references public.job_scopes(id) on delete restrict,

  deliverable_code text       not null, -- e.g., "S101", "CALC-01"
  name            text        not null,
  type            text        not null, -- e.g., 'Drawing', 'Calculation', 'Specification'
  metadata        jsonb,      -- Extensibility for Producer Statements
  status          text        not null default 'ACTIVE' check (status in ('ACTIVE', 'SUPERSEDED', 'VOIDED')),

  UNIQUE(tenant_id, job_id, deliverable_code)
);

CREATE TRIGGER trg_deliverables_updated_at
  BEFORE UPDATE ON public.deliverables
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Revisions
CREATE TABLE public.revisions (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       uuid        not null default public.current_tenant_id(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid        not null references public.staff(id) on delete restrict,
  updated_by      uuid        not null references public.staff(id) on delete restrict,

  deliverable_id  uuid        not null references public.deliverables(id) on delete restrict,
  revision_number text        not null, -- e.g., 'A', 'B', '0', '1'
  status          text        not null default 'DRAFT' check (status in ('DRAFT', 'ISSUED')),
  
  file_url        text,       -- The immutable blob reference when issued
  internal_notes  text,
  
  UNIQUE(tenant_id, deliverable_id, revision_number)
);

CREATE TRIGGER trg_revisions_updated_at
  BEFORE UPDATE ON public.revisions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Transmittals (The Ledger Cover)
CREATE TABLE public.transmittals (
  id                  uuid        primary key default gen_random_uuid(),
  tenant_id           uuid        not null default public.current_tenant_id(),
  created_at          timestamptz not null default now(),
  created_by          uuid        not null references public.staff(id) on delete restrict,

  job_id              uuid        not null references public.jobs(id) on delete restrict,
  transmittal_number  serial,     -- Sequential identifier per tenant (or job, mapped logically)
  issue_date          date        not null default CURRENT_DATE,
  issue_reason        text        not null, -- e.g., 'For Information', 'For Consent', 'For Construction'
  message             text
);

-- 4. Transmittal Items (The Ledger Body)
CREATE TABLE public.transmittal_items (
  transmittal_id  uuid not null references public.transmittals(id) on delete restrict,
  revision_id     uuid not null references public.revisions(id) on delete restrict,
  PRIMARY KEY (transmittal_id, revision_id)
);

-- RLS & Grants
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transmittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transmittal_items ENABLE ROW LEVEL SECURITY;

-- Deliverables Policies
CREATE POLICY deliverables_tenant_select ON public.deliverables FOR SELECT USING (tenant_id = public.current_tenant_id());
CREATE POLICY deliverables_tenant_insert ON public.deliverables FOR INSERT WITH CHECK (tenant_id = public.current_tenant_id());
CREATE POLICY deliverables_tenant_update ON public.deliverables FOR UPDATE USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id());
-- No delete allowed logically, but if needed, restricted by zero issued revisions

-- Revisions Policies
CREATE POLICY revisions_tenant_select ON public.revisions FOR SELECT USING (tenant_id = public.current_tenant_id());
CREATE POLICY revisions_tenant_insert ON public.revisions FOR INSERT WITH CHECK (tenant_id = public.current_tenant_id());
-- Only allow updates to DRAFT revisions
CREATE POLICY revisions_tenant_update_draft ON public.revisions FOR UPDATE 
  USING (tenant_id = public.current_tenant_id() AND status = 'DRAFT') 
  WITH CHECK (tenant_id = public.current_tenant_id());
-- Separate policy to allow the transition from DRAFT to ISSUED specifically (during transmittal transaction)
CREATE POLICY revisions_tenant_update_issue ON public.revisions FOR UPDATE 
  USING (tenant_id = public.current_tenant_id()) 
  WITH CHECK (tenant_id = public.current_tenant_id() AND status = 'ISSUED');

-- Transmittals Policies (Insert / Select ONLY)
CREATE POLICY transmittals_tenant_select ON public.transmittals FOR SELECT USING (tenant_id = public.current_tenant_id());
CREATE POLICY transmittals_tenant_insert ON public.transmittals FOR INSERT WITH CHECK (tenant_id = public.current_tenant_id());

-- Transmittal Items Policies (Insert / Select ONLY)
CREATE POLICY transmittal_items_tenant_select ON public.transmittal_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.transmittals t WHERE t.id = transmittal_items.transmittal_id AND t.tenant_id = public.current_tenant_id())
);
CREATE POLICY transmittal_items_tenant_insert ON public.transmittal_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.transmittals t WHERE t.id = transmittal_items.transmittal_id AND t.tenant_id = public.current_tenant_id())
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliverables TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.revisions TO authenticated, service_role;
GRANT SELECT, INSERT ON public.transmittals TO authenticated, service_role;
GRANT SELECT, INSERT ON public.transmittal_items TO authenticated, service_role;

COMMIT;
