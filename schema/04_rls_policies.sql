-- =============================================================================
-- Plinth — Row Level Security Policies
-- =============================================================================
-- TENANT ISOLATION via RLS
--
-- Every table has RLS enabled with four named policies:
--   {table}_tenant_select  — SELECT
--   {table}_tenant_insert  — INSERT (WITH CHECK)
--   {table}_tenant_update  — UPDATE (USING + WITH CHECK)
--   {table}_tenant_delete  — DELETE (USING)
--
-- POLICY EXPRESSION (same for all):
--   tenant_id = coalesce(
--     (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
--     '00000000-0000-0000-0000-000000000001'::uuid
--   )
--
-- FALLBACK BEHAVIOUR:
-- When no JWT claim is present (e.g. service role calls from Edge Functions
-- or direct psql sessions during development), the coalesce falls back to
-- the bootstrap tenant UUID. This ensures the system works in single-tenant
-- mode without requiring every call to carry a JWT.
--
-- !! MULTI-TENANT LAUNCH REQUIREMENT !!
-- Before going multi-tenant, this fallback MUST be removed. Replace the
-- coalesce expression with a strict check:
--   tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
-- Failing to do so would give unauthenticated requests access to the
-- bootstrap tenant's data.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- tenants
-- ---------------------------------------------------------------------------
alter table public.tenants enable row level security;

create policy tenants_tenant_select on public.tenants
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy tenants_tenant_insert on public.tenants
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy tenants_tenant_update on public.tenants
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy tenants_tenant_delete on public.tenants
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_statuses
-- ---------------------------------------------------------------------------
alter table public.job_statuses enable row level security;

create policy job_statuses_tenant_select on public.job_statuses
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_statuses_tenant_insert on public.job_statuses
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_statuses_tenant_update on public.job_statuses
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_statuses_tenant_delete on public.job_statuses
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_types
-- ---------------------------------------------------------------------------
alter table public.job_types enable row level security;

create policy job_types_tenant_select on public.job_types
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_types_tenant_insert on public.job_types
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_types_tenant_update on public.job_types
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_types_tenant_delete on public.job_types
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- risk_tiers
-- ---------------------------------------------------------------------------
alter table public.risk_tiers enable row level security;

create policy risk_tiers_tenant_select on public.risk_tiers
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy risk_tiers_tenant_insert on public.risk_tiers
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy risk_tiers_tenant_update on public.risk_tiers
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy risk_tiers_tenant_delete on public.risk_tiers
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- disciplines
-- ---------------------------------------------------------------------------
alter table public.disciplines enable row level security;

create policy disciplines_tenant_select on public.disciplines
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy disciplines_tenant_insert on public.disciplines
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy disciplines_tenant_update on public.disciplines
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy disciplines_tenant_delete on public.disciplines
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- office_locations
-- ---------------------------------------------------------------------------
alter table public.office_locations enable row level security;

create policy office_locations_tenant_select on public.office_locations
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy office_locations_tenant_insert on public.office_locations
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy office_locations_tenant_update on public.office_locations
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy office_locations_tenant_delete on public.office_locations
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- staff
-- ---------------------------------------------------------------------------
alter table public.staff enable row level security;

create policy staff_tenant_select on public.staff
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy staff_tenant_insert on public.staff
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy staff_tenant_update on public.staff
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy staff_tenant_delete on public.staff
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
alter table public.clients enable row level security;

create policy clients_tenant_select on public.clients
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy clients_tenant_insert on public.clients
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy clients_tenant_update on public.clients
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy clients_tenant_delete on public.clients
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- client_contacts
-- ---------------------------------------------------------------------------
alter table public.client_contacts enable row level security;

create policy client_contacts_tenant_select on public.client_contacts
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy client_contacts_tenant_insert on public.client_contacts
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy client_contacts_tenant_update on public.client_contacts
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy client_contacts_tenant_delete on public.client_contacts
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
alter table public.jobs enable row level security;

create policy jobs_tenant_select on public.jobs
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy jobs_tenant_insert on public.jobs
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy jobs_tenant_update on public.jobs
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy jobs_tenant_delete on public.jobs
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_offices
-- ---------------------------------------------------------------------------
alter table public.job_offices enable row level security;

create policy job_offices_tenant_select on public.job_offices
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_offices_tenant_insert on public.job_offices
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_offices_tenant_update on public.job_offices
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_offices_tenant_delete on public.job_offices
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_disciplines
-- ---------------------------------------------------------------------------
alter table public.job_disciplines enable row level security;

create policy job_disciplines_tenant_select on public.job_disciplines
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_disciplines_tenant_insert on public.job_disciplines
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_disciplines_tenant_update on public.job_disciplines
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_disciplines_tenant_delete on public.job_disciplines
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_phases
-- ---------------------------------------------------------------------------
alter table public.job_phases enable row level security;

create policy job_phases_tenant_select on public.job_phases
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_phases_tenant_insert on public.job_phases
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_phases_tenant_update on public.job_phases
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_phases_tenant_delete on public.job_phases
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_scopes
-- ---------------------------------------------------------------------------
alter table public.job_scopes enable row level security;

create policy job_scopes_tenant_select on public.job_scopes
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_scopes_tenant_insert on public.job_scopes
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_scopes_tenant_update on public.job_scopes
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_scopes_tenant_delete on public.job_scopes
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- ---------------------------------------------------------------------------
-- job_components
-- ---------------------------------------------------------------------------
alter table public.job_components enable row level security;

create policy job_components_tenant_select on public.job_components
  for select using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_components_tenant_insert on public.job_components
  for insert with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_components_tenant_update on public.job_components
  for update
  using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  )
  with check (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );

create policy job_components_tenant_delete on public.job_components
  for delete using (
    tenant_id = coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
  );


-- =============================================================================
-- GRANTS
-- Expose tables to PostgREST for authenticated users and service_role
-- =============================================================================
grant select, insert, update, delete on public.tenants to authenticated;
grant select, insert, update, delete on public.tenants to service_role;
grant select, insert, update, delete on public.job_statuses to authenticated;
grant select, insert, update, delete on public.job_statuses to service_role;
grant select, insert, update, delete on public.job_types to authenticated;
grant select, insert, update, delete on public.job_types to service_role;
grant select, insert, update, delete on public.risk_tiers to authenticated;
grant select, insert, update, delete on public.risk_tiers to service_role;
grant select, insert, update, delete on public.disciplines to authenticated;
grant select, insert, update, delete on public.disciplines to service_role;
grant select, insert, update, delete on public.office_locations to authenticated;
grant select, insert, update, delete on public.office_locations to service_role;
grant select, insert, update, delete on public.staff to authenticated;
grant select, insert, update, delete on public.staff to service_role;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.clients to service_role;
grant select, insert, update, delete on public.client_contacts to authenticated;
grant select, insert, update, delete on public.client_contacts to service_role;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.jobs to service_role;
grant select, insert, update, delete on public.job_offices to authenticated;
grant select, insert, update, delete on public.job_offices to service_role;
grant select, insert, update, delete on public.job_disciplines to authenticated;
grant select, insert, update, delete on public.job_disciplines to service_role;
grant select, insert, update, delete on public.job_phases to authenticated;
grant select, insert, update, delete on public.job_phases to service_role;
grant select, insert, update, delete on public.job_scopes to authenticated;
grant select, insert, update, delete on public.job_scopes to service_role;
grant select, insert, update, delete on public.job_components to authenticated;
grant select, insert, update, delete on public.job_components to service_role;

