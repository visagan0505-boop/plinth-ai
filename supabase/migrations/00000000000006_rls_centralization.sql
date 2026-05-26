-- =============================================================================
-- Plinth - Migration: 00000000000006_rls_centralization
-- =============================================================================
-- Phase 1: Foundational Hardening
--
-- 1. Drops the 60 existing RLS policies across 15 core/lookup tables.
-- 2. Re-creates them using the centralized `public.current_tenant_id()` function.
-- 3. Enables RLS and creates policies for the new telemetry/infrastructure tables
--    (tenant_sequences, domain_events, staff_rate_periods).
--    NOTE: time_entries RLS is applied in migration 009 where the table is created.
-- 4. Exposes new tables via GRANTs.
--
-- POLICY NAMING CONVENTION (FROZEN):
-- All policies must follow the strict format: {table_name}_tenant_{action}
-- Example: jobs_tenant_select, staff_tenant_insert
--
-- BYPASSRLS RESTRICTION:
-- The use of postgres roles with the BYPASSRLS attribute (e.g. postgres, 
-- service_role in some contexts) is strictly restricted to controlled 
-- infrastructure operations and schema migrations. Application logic MUST 
-- NEVER rely on BYPASSRLS to circumvent tenant isolation.
--
-- Note: domain_events receives INSERT/SELECT policies ONLY to enforce its 
-- append-only operational design.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Drop existing hardcoded policies
-- ---------------------------------------------------------------------------
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'tenants', 'job_statuses', 'job_types', 'risk_tiers', 'disciplines', 
    'office_locations', 'staff', 'clients', 'client_contacts', 'jobs', 
    'job_offices', 'job_disciplines', 'job_phases', 'job_scopes', 'job_components'
  ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_tenant_select ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_tenant_insert ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_tenant_update ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_tenant_delete ON public.%I', t, t);
  END LOOP;
END $$;


-- ---------------------------------------------------------------------------
-- 2. Recreate policies with centralized tenant resolution for original tables
-- ---------------------------------------------------------------------------
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'tenants', 'job_statuses', 'job_types', 'risk_tiers', 'disciplines', 
    'office_locations', 'staff', 'clients', 'client_contacts', 'jobs', 
    'job_offices', 'job_disciplines', 'job_phases', 'job_scopes', 'job_components'
  ])
  LOOP
    EXECUTE format('
      CREATE POLICY %I_tenant_select ON public.%I FOR SELECT USING (tenant_id = public.current_tenant_id());
      CREATE POLICY %I_tenant_insert ON public.%I FOR INSERT WITH CHECK (tenant_id = public.current_tenant_id());
      CREATE POLICY %I_tenant_update ON public.%I FOR UPDATE USING (tenant_id = public.current_tenant_id()) WITH CHECK (tenant_id = public.current_tenant_id());
      CREATE POLICY %I_tenant_delete ON public.%I FOR DELETE USING (tenant_id = public.current_tenant_id());
    ', t, t, t, t, t, t, t, t);
  END LOOP;
END $$;


-- ---------------------------------------------------------------------------
-- 3. Apply RLS and policies to NEW infrastructure tables
-- ---------------------------------------------------------------------------

-- tenant_sequences
alter table public.tenant_sequences enable row level security;
create policy tenant_sequences_tenant_select on public.tenant_sequences for select using (tenant_id = public.current_tenant_id());
create policy tenant_sequences_tenant_insert on public.tenant_sequences for insert with check (tenant_id = public.current_tenant_id());
create policy tenant_sequences_tenant_update on public.tenant_sequences for update using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());
create policy tenant_sequences_tenant_delete on public.tenant_sequences for delete using (tenant_id = public.current_tenant_id());

-- staff_rate_periods
alter table public.staff_rate_periods enable row level security;
create policy staff_rate_periods_tenant_select on public.staff_rate_periods for select using (tenant_id = public.current_tenant_id());
create policy staff_rate_periods_tenant_insert on public.staff_rate_periods for insert with check (tenant_id = public.current_tenant_id());
create policy staff_rate_periods_tenant_update on public.staff_rate_periods for update using (tenant_id = public.current_tenant_id()) with check (tenant_id = public.current_tenant_id());
create policy staff_rate_periods_tenant_delete on public.staff_rate_periods for delete using (tenant_id = public.current_tenant_id());

-- time_entries RLS moved to migration 009 (00000000000009_time_entries.sql)

-- domain_events (APPEND-ONLY)
alter table public.domain_events enable row level security;
create policy domain_events_tenant_select on public.domain_events for select using (tenant_id = public.current_tenant_id());
create policy domain_events_tenant_insert on public.domain_events for insert with check (tenant_id = public.current_tenant_id());
-- UPDATE and DELETE deliberately omitted. Requests will be strictly denied by default RLS behavior.


-- ---------------------------------------------------------------------------
-- 4. Expose new tables via GRANTs
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.tenant_sequences to authenticated;
grant select, insert, update, delete on public.tenant_sequences to service_role;

grant select, insert, update, delete on public.staff_rate_periods to authenticated;
grant select, insert, update, delete on public.staff_rate_periods to service_role;

-- time_entries grants moved to migration 009 (00000000000009_time_entries.sql)

-- domain_events only gets select and insert grants
grant select, insert on public.domain_events to authenticated;
grant select, insert on public.domain_events to service_role;

COMMIT;
