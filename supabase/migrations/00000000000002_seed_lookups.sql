-- =============================================================================
-- Plinth � Seed Lookup Data Migration
-- =============================================================================
-- Seeds the bootstrap tenant and all lookup table data.
-- Source of truth: schema/05_seed_data.sql
-- =============================================================================


-- =========================================================================
-- SOURCE: schema/05_seed_data.sql
-- =========================================================================

-- =============================================================================
-- Plinth — Seed Data (Lookup Tables)
-- =============================================================================
-- Idempotent: uses ON CONFLICT ... DO NOTHING so this file can be re-run
-- safely without duplicating data.
--
-- All lookup rows are created under the bootstrap tenant
-- ('00000000-0000-0000-0000-000000000001'). When onboarding new tenants in
-- the multi-tenant phase, a seed_lookups_for_new_tenant() function must
-- copy these rows — see ADR 001.
-- =============================================================================

-- Bootstrap tenant UUID for readability
do $$ begin perform set_config('app.bootstrap_tenant', '00000000-0000-0000-0000-000000000001', true); end $$;


-- ---------------------------------------------------------------------------
-- tenants — bootstrap tenant
-- ---------------------------------------------------------------------------
insert into public.tenants (id, tenant_id, name, slug, country_code, timezone, currency_code)
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Kirk Roberts Consulting',
  'kirk-roberts-consulting',
  'NZ',
  'Pacific/Auckland',
  'NZD'
)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- job_statuses
-- ---------------------------------------------------------------------------
insert into public.job_statuses (tenant_id, code, name, description, is_terminal, sort_order) values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'OPEN',      'Open',      'Job is actively being worked on',                     false, 1),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'ON_HOLD',   'On Hold',   'Work paused pending client instruction or other event', false, 2),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'CLOSED',    'Closed',    'All work completed and final deliverables issued',      true,  3),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'CANCELLED', 'Cancelled', 'Job cancelled before completion',                      true,  4)
on conflict (tenant_id, code) do nothing;


-- ---------------------------------------------------------------------------
-- job_types
-- ---------------------------------------------------------------------------
insert into public.job_types (tenant_id, code, name, description, sort_order) values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'RES',   'Residential',     'Houses, apartments, and residential developments',         1),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'COM',   'Commercial',      'Office, retail, hospitality, and mixed-use buildings',      2),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'INF',   'Infrastructure',  'Bridges, retaining walls, and civil infrastructure',        3),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'IND',   'Industrial',      'Warehouses, factories, and industrial facilities',          4),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'REM',   'Remedial',        'Strengthening, repair, and remediation of existing assets', 5)
on conflict (tenant_id, code) do nothing;


-- ---------------------------------------------------------------------------
-- risk_tiers
-- ---------------------------------------------------------------------------
-- Fee thresholds are approximate NZ market values for a mid-size structural
-- consultancy. These should be reviewed and adjusted per tenant.
-- Tier A = highest risk/value, Tier D = lowest.
-- ---------------------------------------------------------------------------
insert into public.risk_tiers (tenant_id, code, name, description, min_fee_value, max_fee_value, requires_director_signoff, requires_peer_review, requires_pi_insurance_check, sort_order) values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'A', 'Tier A — Major Projects',    'High-value and high-risk projects requiring full governance',          500000.01, null,      true,  true,  true,  1),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'B', 'Tier B — Large Commercial',  'Significant projects requiring director oversight and peer review',    100000.01, 500000.00, true,  true,  false, 2),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'C', 'Tier C — Medium Projects',   'Mid-range projects requiring peer review',                             20000.01, 100000.00, false, true,  false, 3),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'D', 'Tier D — Small Residential', 'Low-complexity residential work with standard sign-off',                   0.01,  20000.00, false, false, false, 4)
on conflict (tenant_id, code) do nothing;


-- ---------------------------------------------------------------------------
-- disciplines
-- ---------------------------------------------------------------------------
-- Hourly rates are realistic 2025-2026 NZ market rates (NZD + GST excl.)
-- for a mid-size structural engineering consultancy.
-- ---------------------------------------------------------------------------
insert into public.disciplines (tenant_id, code, name, description, requires_cpeng, default_hourly_rate, sort_order) values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'STR',  'Structural',          'Structural engineering design and analysis',          true,  250.00, 1),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'GEO',  'Geotechnical',        'Geotechnical investigation and foundation design',    true,  270.00, 2),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'STRD', 'Structural Drafting', 'Structural detailing and production drawings',        false, 150.00, 3),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'CIV',  'Civil',               'Civil engineering design (drainage, earthworks)',      true,  240.00, 4),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'FIRE', 'Fire',                'Fire engineering assessment and design',               true,  260.00, 5)
on conflict (tenant_id, code) do nothing;


-- ---------------------------------------------------------------------------
-- office_locations
-- ---------------------------------------------------------------------------
insert into public.office_locations (tenant_id, code, name, description, country_code, timezone, sort_order) values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'AKL', 'Auckland',     'Head office',  'NZ', 'Pacific/Auckland',     1),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'WLG', 'Wellington',   null,           'NZ', 'Pacific/Auckland',     2),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'CHC', 'Christchurch', null,           'NZ', 'Pacific/Auckland',     3),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'SYD', 'Sydney',       null,           'AU', 'Australia/Sydney',     4),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'MEL', 'Melbourne',    null,           'AU', 'Australia/Melbourne',  5),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'LDN', 'London',       null,           'UK', 'Europe/London',        6)
on conflict (tenant_id, code) do nothing;
