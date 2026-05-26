-- ==========================================
-- Performance Baseline Queries
-- ==========================================
-- Establishes execution plans for critical pathways

BEGIN;

-- Run EXPLAIN on the most intensive queries to establish baseline query plans
-- Output can be captured in CI to detect regression (e.g., missing indexes)

EXPLAIN ANALYZE
SELECT j.job_number, j.title, s.name as status
FROM public.jobs j
JOIN public.job_statuses s ON j.status_id = s.id
WHERE j.tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY j.created_at DESC
LIMIT 50;

EXPLAIN ANALYZE
SELECT t.id, t.duration_minutes, t.recorded_date, r.bill_rate
FROM public.time_entries t
JOIN public.staff_rate_periods r ON t.staff_id = r.staff_id 
  AND t.recorded_date >= r.effective_from 
  AND (t.recorded_date < r.effective_to OR r.effective_to IS NULL)
WHERE t.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND t.recorded_date > current_date - interval '30 days';

EXPLAIN ANALYZE
SELECT payload, occurred_at 
FROM public.domain_events
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
  AND event_type = 'job.status_changed'
ORDER BY occurred_at DESC
LIMIT 100;

ROLLBACK;
