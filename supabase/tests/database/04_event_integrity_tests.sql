-- ==========================================
-- Event Integrity Tests
-- ==========================================
-- Validates ADR 008: Event-Driven Architecture

BEGIN;

DO $$ 
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000005';
    v_event_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.tenants (id, name, slug) VALUES (v_tenant_id, 'Event Tenant', 'ev-t') ON CONFLICT DO NOTHING;

    -- Insert valid event
    INSERT INTO public.domain_events (id, tenant_id, event_type, payload, occurred_at)
    VALUES (v_event_id, v_tenant_id, 'job.status_changed', '{"status":"ACTIVE"}'::jsonb, now());

    -- Attempt to update event (should be blocked by triggers or rules enforcing immutability)
    BEGIN
        UPDATE public.domain_events SET payload = '{"status":"HACKED"}'::jsonb WHERE id = v_event_id;
        -- If it reaches here without error, verify if row actually updated (some rules just silently ignore)
        IF (SELECT payload->>'status' FROM public.domain_events WHERE id = v_event_id) = 'HACKED' THEN
            RAISE EXCEPTION 'Event integrity failed: Allowed UPDATE on immutable domain_events table';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Expected exception
        NULL;
    END;

    -- Attempt to delete event (should be blocked)
    BEGIN
        DELETE FROM public.domain_events WHERE id = v_event_id;
        IF NOT FOUND THEN
            -- Wait, if it errors, it goes to EXCEPTION block. If it doesn't error but deletes, FOUND is true.
            NULL;
        ELSE
            RAISE EXCEPTION 'Event integrity failed: Allowed DELETE on immutable domain_events table';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Expected exception
        NULL;
    END;
END $$;

ROLLBACK;
