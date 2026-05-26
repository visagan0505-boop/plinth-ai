-- ==========================================
-- Sequence Concurrency Tests
-- ==========================================
-- Validates ADR 010: Sequence Generation Strategy

BEGIN;

DO $$ 
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000004';
    v_seq_type TEXT := 'job_number';
    v_seq_prefix TEXT := '2026';
    v_result1 INT;
    v_result2 INT;
BEGIN
    INSERT INTO public.tenants (id, name, slug) VALUES (v_tenant_id, 'Seq Tenant', 'seq-t') ON CONFLICT DO NOTHING;

    -- Initialize sequence for prefix
    INSERT INTO public.tenant_sequences (tenant_id, sequence_type, prefix, current_value)
    VALUES (v_tenant_id, v_seq_type, v_seq_prefix, 0)
    ON CONFLICT DO NOTHING;

    -- Simulate atomic fetch 1
    UPDATE public.tenant_sequences 
    SET current_value = current_value + 1
    WHERE tenant_id = v_tenant_id AND sequence_type = v_seq_type AND prefix = v_seq_prefix
    RETURNING current_value INTO v_result1;

    -- Simulate atomic fetch 2
    UPDATE public.tenant_sequences 
    SET current_value = current_value + 1
    WHERE tenant_id = v_tenant_id AND sequence_type = v_seq_type AND prefix = v_seq_prefix
    RETURNING current_value INTO v_result2;

    IF v_result1 = v_result2 THEN
        RAISE EXCEPTION 'Sequence concurrency failed: Duplicate sequence generated (%, %)', v_result1, v_result2;
    END IF;

    IF v_result2 != 2 THEN
        RAISE EXCEPTION 'Sequence logic failed: Expected 2, got %', v_result2;
    END IF;
END $$;

ROLLBACK;
