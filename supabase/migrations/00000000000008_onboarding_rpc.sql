-- =============================================================================
-- Plinth - Migration: 00000000000008_onboarding_rpc
-- =============================================================================
-- Phase 3B: Tenant Onboarding Transaction
--
-- Exposes a secure Security Definer function to allow atomic tenant bootstrap.
-- It creates the tenant, office, discipline, and the initial staff record
-- bound to the authenticating user, effectively making them the first
-- tenant administrator/director.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.bootstrap_tenant(
  p_tenant_name text,
  p_tenant_slug text,
  p_office_name text,
  p_discipline_name text,
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_role text,
  p_hourly_cost_rate numeric,
  p_hourly_bill_rate numeric
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id uuid;
  v_office_id uuid;
  v_discipline_id uuid;
  v_staff_id uuid;
BEGIN
  -- 1. Create Tenant (generate ID first to satisfy self-reference constraint)
  v_tenant_id := gen_random_uuid();
  
  INSERT INTO public.tenants (id, tenant_id, name, slug, country_code, timezone, currency_code)
  VALUES (v_tenant_id, v_tenant_id, p_tenant_name, p_tenant_slug, 'NZ', 'Pacific/Auckland', 'NZD');
  
  -- 2. Create Office Location
  INSERT INTO public.office_locations (tenant_id, code, name, country_code, timezone, sort_order)
  VALUES (v_tenant_id, 'MAIN', p_office_name, 'NZ', 'Pacific/Auckland', 1)
  RETURNING id INTO v_office_id;
 
  -- 3. Create Discipline
  INSERT INTO public.disciplines (tenant_id, code, name, requires_cpeng, default_hourly_rate, sort_order)
  VALUES (v_tenant_id, 'ENG', p_discipline_name, false, p_hourly_bill_rate, 1)
  RETURNING id INTO v_discipline_id;
 
  -- 4. Create Staff (Linking office, discipline, and user)
  INSERT INTO public.staff (
    tenant_id, 
    auth_user_id, 
    email, 
    full_name, 
    role, 
    primary_office_id, 
    primary_discipline_id, 
    hourly_cost_rate, 
    hourly_bill_rate
  )
  VALUES (
    v_tenant_id, 
    p_user_id, 
    p_email, 
    p_full_name, 
    p_role, 
    v_office_id, 
    v_discipline_id, 
    p_hourly_cost_rate, 
    p_hourly_bill_rate
  )
  RETURNING id INTO v_staff_id;
 
  -- The bootstrap user has no created_by/updated_by since they are the first user.
  -- Subsequent users will have these audit fields populated.
 
  RETURN v_tenant_id;
END;
$$;

COMMIT;
