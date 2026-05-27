-- =============================================================================
-- Plinth - Migration: 00000000000013_profitability_foundation
-- =============================================================================
-- Phase 4: Operational Intelligence
--
-- Introduces the foundational financial rates and budgets required to 
-- calculate operational WIP burn directly from the telemetry ledger.
-- =============================================================================

BEGIN;

-- 1. Staff Rates (Global Defaults for Phase 4)
-- The internal hourly cost of the employee
ALTER TABLE public.staff ADD COLUMN hourly_cost_rate numeric(10, 2) NOT NULL DEFAULT 0.00;
-- The external hourly rate billed to the client
ALTER TABLE public.staff ADD COLUMN hourly_charge_rate numeric(10, 2) NOT NULL DEFAULT 0.00;

-- 2. Phase Budgets
-- The revenue allocated to deliver this specific phase of work
ALTER TABLE public.job_phases ADD COLUMN fee_budget numeric(12, 2) NOT NULL DEFAULT 0.00;


-- 3. Profitability Telemetry Views
-- We use standard SQL views here as they adhere perfectly to the 
-- Immutable Telemetry Derivation Rule. They dynamically aggregate the truth.

-- View: Phase Financial Burn
-- Aggregates time entries by phase, multiplying duration by the staff's cost rate at the time of query.
CREATE OR REPLACE VIEW public.vw_phase_financial_burn AS
SELECT 
  t.tenant_id,
  t.job_phase_id,
  p.job_id,
  p.name AS phase_name,
  p.fee_budget,
  SUM(t.duration_minutes) AS total_minutes,
  SUM((t.duration_minutes::numeric / 60.0) * s.hourly_cost_rate) AS total_cost_burn,
  SUM((t.duration_minutes::numeric / 60.0) * s.hourly_charge_rate) AS total_billable_value
FROM public.time_entries t
JOIN public.job_phases p ON t.job_phase_id = p.id
JOIN public.staff s ON t.staff_id = s.id
GROUP BY t.tenant_id, t.job_phase_id, p.job_id, p.name, p.fee_budget;

-- View: Job Level Aggregation
CREATE OR REPLACE VIEW public.vw_job_financial_burn AS
SELECT
  v.tenant_id,
  v.job_id,
  j.name AS job_name,
  j.job_number,
  SUM(v.fee_budget) AS total_fee_budget,
  SUM(v.total_minutes) AS total_minutes,
  SUM(v.total_cost_burn) AS total_cost_burn,
  SUM(v.total_billable_value) AS total_billable_value
FROM public.vw_phase_financial_burn v
JOIN public.jobs j ON v.job_id = j.id
GROUP BY v.tenant_id, v.job_id, j.name, j.job_number;


-- Grants for the views so the server client can query them
GRANT SELECT ON public.vw_phase_financial_burn TO authenticated, service_role;
GRANT SELECT ON public.vw_job_financial_burn TO authenticated, service_role;

COMMIT;
