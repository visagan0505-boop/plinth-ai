-- =============================================================================
-- Plinth — Indexes
-- =============================================================================
-- Non-PK, non-unique-constraint indexes. PostgreSQL does NOT auto-create
-- indexes on foreign key columns — every FK needs an explicit index for
-- efficient joins and cascading deletes.
--
-- Indexes are grouped by table, with a comment on each explaining the
-- query pattern it serves.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- staff
-- ---------------------------------------------------------------------------

-- FK index: look up staff by discipline (e.g. "all structural engineers")
create index idx_staff_primary_discipline on public.staff (primary_discipline_id);

-- FK index: look up staff by office (e.g. "all Auckland staff")
create index idx_staff_primary_office on public.staff (primary_office_id);

-- FK index: look up staff by manager (e.g. "direct reports for manager X")
create index idx_staff_manager on public.staff (manager_id);

-- FK index: audit trail — who created this staff record
create index idx_staff_created_by on public.staff (created_by);

-- FK index: audit trail — who last updated this staff record
create index idx_staff_updated_by on public.staff (updated_by);

-- Login lookup: find staff by email without knowing tenant_id.
-- The unique constraint on (tenant_id, email) cannot serve email-only
-- queries because tenant_id is the leading column. This standalone index
-- supports the authentication flow where email is provided first.
create index idx_staff_email on public.staff (email);

-- Auth user lookup: resolve Supabase auth.users.id to staff record
create index idx_staff_auth_user on public.staff (auth_user_id)
  where auth_user_id is not null;


-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------

-- RLS and tenant filtering: clients has no unique constraint with tenant_id
-- as a leading column, so we need a standalone index for RLS performance.
create index idx_clients_tenant on public.clients (tenant_id);

-- FK index: audit trail
create index idx_clients_created_by on public.clients (created_by);
create index idx_clients_updated_by on public.clients (updated_by);


-- ---------------------------------------------------------------------------
-- client_contacts
-- ---------------------------------------------------------------------------

-- RLS and tenant filtering
create index idx_client_contacts_tenant on public.client_contacts (tenant_id);

-- FK index: look up contacts for a client
create index idx_client_contacts_client on public.client_contacts (client_id);

-- FK index: audit trail
create index idx_client_contacts_created_by on public.client_contacts (created_by);
create index idx_client_contacts_updated_by on public.client_contacts (updated_by);

-- Partial unique index: at most one primary contact per client per tenant.
-- This cannot be expressed as a table-level UNIQUE constraint because it
-- is conditional on is_primary = true.
create unique index idx_client_contacts_one_primary
  on public.client_contacts (tenant_id, client_id)
  where is_primary = true;


-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------

-- The most common query: "list open jobs for this tenant".
-- Composite index serves both tenant-only and tenant+status filters.
create index idx_jobs_tenant_status on public.jobs (tenant_id, status_id);

-- FK index: list jobs for a client
create index idx_jobs_client on public.jobs (client_id);

-- FK index: list jobs by type
create index idx_jobs_job_type on public.jobs (job_type_id);

-- FK index: list jobs by risk tier
create index idx_jobs_risk_tier on public.jobs (risk_tier_id);

-- FK index: list jobs where a specific person is project director
create index idx_jobs_project_director on public.jobs (project_director_id);

-- FK index: list jobs where a specific person is design manager
create index idx_jobs_design_manager on public.jobs (design_manager_id)
  where design_manager_id is not null;

-- FK index: list jobs by primary office
create index idx_jobs_primary_office on public.jobs (primary_office_id);

-- FK index: audit trail
create index idx_jobs_created_by on public.jobs (created_by);
create index idx_jobs_updated_by on public.jobs (updated_by);


-- ---------------------------------------------------------------------------
-- job_offices (junction)
-- ---------------------------------------------------------------------------

-- RLS tenant filtering
create index idx_job_offices_tenant on public.job_offices (tenant_id);

-- FK index: the composite PK (job_id, office_location_id) covers job_id
-- lookups, but office_location_id needs its own index for "which jobs use
-- this office?" queries and cascade delete performance.
create index idx_job_offices_office on public.job_offices (office_location_id);


-- ---------------------------------------------------------------------------
-- job_disciplines (junction)
-- ---------------------------------------------------------------------------

-- RLS tenant filtering
create index idx_job_disciplines_tenant on public.job_disciplines (tenant_id);

-- FK index: "which jobs involve this discipline?" queries
create index idx_job_disciplines_discipline on public.job_disciplines (discipline_id);


-- ---------------------------------------------------------------------------
-- job_phases
-- ---------------------------------------------------------------------------

-- RLS tenant filtering
create index idx_job_phases_tenant on public.job_phases (tenant_id);

-- FK index: list phases for a job (the most common access pattern)
create index idx_job_phases_job on public.job_phases (job_id);

-- FK index: audit trail
create index idx_job_phases_created_by on public.job_phases (created_by);
create index idx_job_phases_updated_by on public.job_phases (updated_by);


-- ---------------------------------------------------------------------------
-- job_scopes
-- ---------------------------------------------------------------------------

-- RLS tenant filtering
create index idx_job_scopes_tenant on public.job_scopes (tenant_id);

-- FK index: list scopes for a phase
create index idx_job_scopes_phase on public.job_scopes (phase_id);

-- FK index: audit trail
create index idx_job_scopes_created_by on public.job_scopes (created_by);
create index idx_job_scopes_updated_by on public.job_scopes (updated_by);


-- ---------------------------------------------------------------------------
-- job_components
-- ---------------------------------------------------------------------------

-- RLS tenant filtering
create index idx_job_components_tenant on public.job_components (tenant_id);

-- FK index: list components for a scope
create index idx_job_components_scope on public.job_components (scope_id);

-- FK index: audit trail
create index idx_job_components_created_by on public.job_components (created_by);
create index idx_job_components_updated_by on public.job_components (updated_by);
