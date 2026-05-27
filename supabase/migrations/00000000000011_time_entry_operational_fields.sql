-- =============================================================================
-- Plinth - Migration: 00000000000011_time_entry_operational_fields
-- =============================================================================
-- Phase 3E: Time Entry Workflow
--
-- Adds scope and component references to support fine-grained telemetry.
-- =============================================================================

BEGIN;

ALTER TABLE public.time_entries 
  ADD COLUMN scope_id uuid references public.job_scopes(id) on delete restrict,
  ADD COLUMN component_id uuid references public.job_components(id) on delete restrict;

-- Ensure status default aligns with the "No Draft" principle
ALTER TABLE public.time_entries ALTER COLUMN status SET DEFAULT 'SUBMITTED';

COMMIT;
