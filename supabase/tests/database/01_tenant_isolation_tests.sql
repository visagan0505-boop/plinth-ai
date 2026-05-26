-- ==========================================
-- Tenant Isolation Tests
-- ==========================================
-- Validates ADR 002: Multi-Tenant Strategy

BEGIN;

-- We assume pgTAP is available, or we use DO blocks for assertions.
-- To run via pgTAP: SELECT plan(5);

-- 1. Setup mock tenants
INSERT INTO public.tenants (id, name, slug) VALUES 
('00000000-0000-0000-0000-000000000001', 'Tenant A', 'tenant-a'),
('00000000-0000-0000-0000-000000000002', 'Tenant B', 'tenant-b')
ON CONFLICT DO NOTHING;

-- 2. Setup mock staff
INSERT INTO public.staff (id, tenant_id, auth_user_id, email, first_name, last_name, status)
VALUES 
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'a@tenant.com', 'Alice', 'A', 'ACTIVE'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000002', gen_random_uuid(), 'b@tenant.com', 'Bob', 'B', 'ACTIVE');

-- 3. Setup mock jobs
INSERT INTO public.jobs (id, tenant_id, job_number, title)
VALUES 
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '2026-0001', 'Job A'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000002', '2026-0002', 'Job B');

-- 4. Set current role context to Tenant A
SET LOCAL role "authenticated";
SET LOCAL request.jwt.claims TO '{"app_metadata": {"tenant_id": "00000000-0000-0000-0000-000000000001"}}';

-- 5. Assertions
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
  UPDATE public.jobs SET title = 'Hacked' WHERE tenant_id = '00000000-0000-0000-0000-000000000002';
  IF FOUND THEN
    RAISE EXCEPTION 'Tenant A was able to update Tenant B''s job!';
  END IF;
END $$;

ROLLBACK;
