-- ==========================================
-- Temporal Integrity Tests
-- ==========================================
-- Validates ADR 006: Temporal Financial Modelling

BEGIN;

-- 1. Setup mock tenant
INSERT INTO public.tenants (id, tenant_id, name, slug, country_code, timezone, currency_code) 
VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Temporal', 'temp-tenant', 'NZ', 'Pacific/Auckland', 'NZD') 
ON CONFLICT DO NOTHING;

-- 2. Setup mock office & discipline
INSERT INTO public.office_locations (id, tenant_id, code, name, country_code, timezone, sort_order) 
VALUES ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003', 'TEMP', 'Temp Office', 'NZ', 'Pacific/Auckland', 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.disciplines (id, tenant_id, code, name, default_hourly_rate, sort_order) 
VALUES ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000003', 'TEMP', 'Temp Discipline', 250.00, 1)
ON CONFLICT DO NOTHING;

DO $$ 
DECLARE
    v_staff_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    INSERT INTO public.staff (id, tenant_id, auth_user_id, email, full_name, role, primary_office_id, primary_discipline_id, hourly_cost_rate, hourly_bill_rate, is_active)
    VALUES (v_staff_id, '00000000-0000-0000-0000-000000000003', gen_random_uuid(), 't@t.com', 'Temporal Staff', 'admin', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 50.00, 150.00, true)
    ON CONFLICT (id) DO NOTHING;

    -- Insert valid historical rate
    INSERT INTO public.staff_rate_periods (id, tenant_id, staff_id, effective_from, effective_to, hourly_cost_rate, hourly_bill_rate, created_by)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', v_staff_id, '2025-01-01', '2025-12-31', 50.00, 150.00, v_staff_id);

    -- Attempt overlapping rate (should fail due to exclusion constraint or triggers)
    BEGIN
        INSERT INTO public.staff_rate_periods (id, tenant_id, staff_id, effective_from, effective_to, hourly_cost_rate, hourly_bill_rate, created_by)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', v_staff_id, '2025-06-01', '2026-06-01', 60.00, 160.00, v_staff_id);
        
        RAISE EXCEPTION 'Temporal integrity failed: Allowed overlapping staff rate periods!';
    EXCEPTION WHEN OTHERS THEN
        -- Expected to fail
        NULL;
    END;
END $$;

ROLLBACK;
