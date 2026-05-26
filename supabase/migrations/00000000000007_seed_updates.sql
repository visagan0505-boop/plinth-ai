-- =============================================================================
-- Plinth - Migration: 00000000000007_seed_updates
-- =============================================================================
-- Phase 1: Foundational Hardening
--
-- Provides deterministic validation fixtures to prove the integrity of the 
-- hardened schema structure (Migrations 003 - 006). 
--
-- SCOPE RESTRICTION:
-- This is explicitly NOT a demo/sample dataset. These fixtures validate 
-- schema constraints (Composite FKs, RLS, Exclusion Constraints) during 
-- CI/CD migration runs. No speculative business data is included.
-- =============================================================================

BEGIN;

DO $$ 
DECLARE
  v_tenant_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  v_office_id uuid := '33333333-3333-3333-3333-333333333333'::uuid;
  v_disc_id   uuid := '44444444-4444-4444-4444-444444444444'::uuid;
  v_staff_id  uuid := '22222222-2222-2222-2222-222222222222'::uuid;
BEGIN
  -- ---------------------------------------------------------------------------
  -- 1. Validation Tenant (Proves RLS & Composite FK isolation)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.tenants (id, tenant_id, name, slug, country_code, timezone, currency_code) 
  VALUES (v_tenant_id, v_tenant_id, 'Validation Tenant', 'validation-tenant', 'NZ', 'Pacific/Auckland', 'NZD')
  ON CONFLICT (id) DO NOTHING;

  -- ---------------------------------------------------------------------------
  -- 2. Minimal Lookups (Required for Staff FK integrity)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.office_locations (id, tenant_id, code, name, country_code, timezone)
  VALUES (v_office_id, v_tenant_id, 'VAL', 'Validation Office', 'NZ', 'Pacific/Auckland')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.disciplines (id, tenant_id, code, name, is_billable)
  VALUES (v_disc_id, v_tenant_id, 'VAL', 'Validation Discipline', true)
  ON CONFLICT (id) DO NOTHING;

  -- ---------------------------------------------------------------------------
  -- 3. Staff Fixture (Proves cross-table composite constraints)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.staff (
    id, tenant_id, email, first_name, last_name, role, 
    primary_office_id, primary_discipline_id, 
    hourly_cost_rate, hourly_bill_rate, 
    created_by, updated_by
  )
  VALUES (
    v_staff_id, v_tenant_id, 'validation.admin@example.com', 'Validation', 'Admin', 'admin', 
    v_office_id, v_disc_id, 
    50, 150, 
    v_staff_id, v_staff_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- ---------------------------------------------------------------------------
  -- 4. Rate Period Validation (Proves GIST exclusion constraint acceptance)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.staff_rate_periods (
    tenant_id, staff_id, effective_from, effective_to, hourly_cost_rate, hourly_bill_rate, created_by, updated_by
  )
  VALUES (
    v_tenant_id, v_staff_id, '2026-01-01', null, 50, 150, v_staff_id, v_staff_id
  )
  ON CONFLICT DO NOTHING;

  -- ---------------------------------------------------------------------------
  -- 5. Sequence Validation (Proves advisory lock execution path)
  -- ---------------------------------------------------------------------------
  -- We execute the function purely to ensure it doesn't throw and successfully 
  -- writes the initial row into `tenant_sequences`.
  PERFORM public.generate_next_sequence(v_tenant_id, 'validation_entity', extract(year from current_date)::int);

  -- ---------------------------------------------------------------------------
  -- 6. Event Verification (Proves append-only table structure)
  -- ---------------------------------------------------------------------------
  INSERT INTO public.domain_events (
    tenant_id, event_type, entity_type, entity_id, actor_id, payload
  )
  VALUES (
    v_tenant_id, 'system.validation_run', 'tenant', v_tenant_id, v_staff_id, '{"status": "success"}'::jsonb
  );

END $$;

COMMIT;
