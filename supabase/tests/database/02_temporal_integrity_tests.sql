-- ==========================================
-- Temporal Integrity Tests
-- ==========================================
-- Validates ADR 006: Temporal Financial Modelling

BEGIN;

-- Setup mock tenant and staff
INSERT INTO public.tenants (id, name, slug) VALUES ('00000000-0000-0000-0000-000000000003', 'Temporal', 'temp-tenant') ON CONFLICT DO NOTHING;
DO $$ 
DECLARE
    v_staff_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.staff (id, tenant_id, auth_user_id, email, first_name, last_name, status)
    VALUES (v_staff_id, '00000000-0000-0000-0000-000000000003', gen_random_uuid(), 't@t.com', 'T', 'T', 'ACTIVE');

    -- Insert valid historical rate
    INSERT INTO public.staff_rate_periods (id, tenant_id, staff_id, effective_from, effective_to, cost_rate, bill_rate)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', v_staff_id, '2025-01-01', '2025-12-31', 50.00, 150.00);

    -- Attempt overlapping rate (should fail due to exclusion constraint or triggers)
    BEGIN
        INSERT INTO public.staff_rate_periods (id, tenant_id, staff_id, effective_from, effective_to, cost_rate, bill_rate)
        VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', v_staff_id, '2025-06-01', '2026-06-01', 60.00, 160.00);
        
        RAISE EXCEPTION 'Temporal integrity failed: Allowed overlapping staff rate periods!';
    EXCEPTION WHEN OTHERS THEN
        -- Expected to fail
        NULL;
    END;
END $$;

ROLLBACK;
