-- ==========================================
-- Tenant Isolation Tests
-- ==========================================
-- Validates ADR 002: Multi-Tenant Strategy

BEGIN;

-- 1. Setup mock tenants
INSERT INTO public.tenants (id, tenant_id, name, slug, country_code, timezone, currency_code) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Tenant A', 'tenant-a', 'NZ', 'Pacific/Auckland', 'NZD'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Tenant B', 'tenant-b', 'NZ', 'Pacific/Auckland', 'NZD')
ON CONFLICT DO NOTHING;

-- 2. Setup lookup constraints (offices, clients, statuses, types, risk tiers)
INSERT INTO public.office_locations (id, tenant_id, code, name, country_code, timezone, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'OFFA', 'Office A', 'NZ', 'Pacific/Auckland', 1),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'OFFB', 'Office B', 'NZ', 'Pacific/Auckland', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.disciplines (id, tenant_id, code, name, default_hourly_rate, sort_order) VALUES
('11111111-2222-3333-4444-555555555555', '00000000-0000-0000-0000-000000000001', 'VAL', 'Engineering', 250.00, 1),
('22222222-3333-4444-5555-666666666666', '00000000-0000-0000-0000-000000000002', 'VAL', 'Engineering', 250.00, 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.clients (id, tenant_id, name, status) VALUES
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Client A', 'active'),
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000002', 'Client B', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO public.job_statuses (id, tenant_id, code, name, sort_order) VALUES
('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', 'OPEN', 'Open', 1),
('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000002', 'OPEN', 'Open', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.job_types (id, tenant_id, code, name, sort_order) VALUES
('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000001', 'RES', 'Residential', 1),
('88888888-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000002', 'RES', 'Residential', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.risk_tiers (id, tenant_id, code, name, min_fee_value, sort_order) VALUES
('99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000001', 'D', 'Tier D', 1.00, 1),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000002', 'D', 'Tier D', 1.00, 1)
ON CONFLICT DO NOTHING;

-- 3. Setup mock staff (Satisfying primary_office_id, primary_discipline_id, role, cost/bill rates)
INSERT INTO public.staff (id, tenant_id, auth_user_id, email, full_name, role, primary_office_id, primary_discipline_id, hourly_cost_rate, hourly_bill_rate, is_active)
VALUES 
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'deadbeef-1111-1111-1111-111111111111', 'a@tenant.com', 'Alice A', 'admin', '11111111-1111-1111-1111-111111111111', '11111111-2222-3333-4444-555555555555', 50.00, 150.00, true),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000002', 'deadbeef-2222-2222-2222-222222222222', 'b@tenant.com', 'Bob B', 'admin', '22222222-2222-2222-2222-222222222222', '22222222-3333-4444-5555-666666666666', 50.00, 150.00, true)
ON CONFLICT DO NOTHING;

-- 4. Setup mock jobs (using name instead of title, satisfying client, type, status, risk tier, office, PD)
INSERT INTO public.jobs (id, tenant_id, job_number, name, client_id, job_type_id, status_id, risk_tier_id, project_director_id, primary_office_id, created_by, updated_by)
VALUES 
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000001', '2026-0001', 'Job A', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000002', '2026-0002', 'Job B', '44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- 5. Set current role context to Tenant A
SET LOCAL role "authenticated";
SET LOCAL request.jwt.claims TO '{"app_metadata": {"tenant_id": "00000000-0000-0000-0000-000000000001"}}';

-- 6. Assertions
DO $$ 
DECLARE
  job_count INT;
BEGIN
  -- Tenant A should only see 1 job
  SELECT count(*) INTO job_count FROM public.jobs;
  IF job_count != 1 THEN 
    RAISE EXCEPTION 'Tenant isolation failed. Tenant A saw % jobs.', job_count;
  END IF;
  
  -- Tenant A trying to update Tenant B's job should fail or affect 0 rows
  UPDATE public.jobs SET name = 'Hacked' WHERE tenant_id = '00000000-0000-0000-0000-000000000002';
  IF FOUND THEN
    RAISE EXCEPTION 'Tenant A was able to update Tenant B''s job!';
  END IF;
END $$;

ROLLBACK;
