-- ==========================================
-- Migration Repeatability Tests
-- ==========================================
-- Validates safe execution and idempotency of seeded tables

BEGIN;

DO $$ 
DECLARE
    status_count INT;
BEGIN
    -- Verify seed data is intact
    SELECT count(*) INTO status_count FROM public.job_statuses;
    IF status_count = 0 THEN
        RAISE EXCEPTION 'Migration repeatability failed: Missing seeded job_statuses';
    END IF;

    -- Simulate an idempotent upsert that a migration might run
    INSERT INTO public.job_statuses (code, name, is_active, display_order)
    VALUES ('ACTIVE', 'Active', true, 10)
    ON CONFLICT (code) DO UPDATE 
    SET name = EXCLUDED.name, is_active = EXCLUDED.is_active;

    -- Verify no duplicates were created
    SELECT count(*) INTO status_count FROM public.job_statuses WHERE code = 'ACTIVE';
    IF status_count > 1 THEN
        RAISE EXCEPTION 'Migration repeatability failed: Duplicate seed values created';
    END IF;
END $$;

ROLLBACK;
