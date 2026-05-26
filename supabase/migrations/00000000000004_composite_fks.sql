-- =============================================================================
-- Plinth - Migration: 00000000000004_composite_fks
-- =============================================================================
-- Phase 1: Foundational Hardening
-- 
-- 1. UNIQUE Constraints: Adds (tenant_id, id) composite unique constraints 
--    to all referenced tables to support composite FKs.
-- 2. FK Replacement: Drops all auto-named single-column FKs and replaces 
--    them with explicitly named composite FKs (tenant_id, referenced_id).
--
-- This migration guarantees that application code cannot accidentally link 
-- a Job from Tenant A to a Client in Tenant B, establishing hard data 
-- isolation below the RLS layer.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Composite UNIQUE Constraints
-- ---------------------------------------------------------------------------
-- PostgreSQL requires the referenced columns in a foreign key to have a 
-- unique constraint or index. We add these to every table that is the 
-- target of an FK.
-- ---------------------------------------------------------------------------

-- Lookup Tables
alter table public.job_statuses add constraint uq_job_statuses_tid_id unique (tenant_id, id);
alter table public.job_types add constraint uq_job_types_tid_id unique (tenant_id, id);
alter table public.risk_tiers add constraint uq_risk_tiers_tid_id unique (tenant_id, id);
alter table public.disciplines add constraint uq_disciplines_tid_id unique (tenant_id, id);
alter table public.office_locations add constraint uq_office_locations_tid_id unique (tenant_id, id);
-- Note: 'tenants' already enforces (tenant_id = id), making id intrinsically tenant-bound.

-- Core Tables
alter table public.staff add constraint uq_staff_tid_id unique (tenant_id, id);
alter table public.clients add constraint uq_clients_tid_id unique (tenant_id, id);
alter table public.client_contacts add constraint uq_client_contacts_tid_id unique (tenant_id, id);
alter table public.jobs add constraint uq_jobs_tid_id unique (tenant_id, id);
alter table public.job_phases add constraint uq_job_phases_tid_id unique (tenant_id, id);
alter table public.job_scopes add constraint uq_job_scopes_tid_id unique (tenant_id, id);
alter table public.job_components add constraint uq_job_components_tid_id unique (tenant_id, id);


-- ---------------------------------------------------------------------------
-- 2. FK Conversion (Drop & Recreate)
-- ---------------------------------------------------------------------------
-- We explicitly name the new constraints for future observability.
-- We retain the existing ON DELETE behaviors (CASCADE or RESTRICT).
-- ---------------------------------------------------------------------------

-- 2.1. staff
alter table public.staff
  drop constraint staff_primary_discipline_id_fkey,
  drop constraint staff_primary_office_id_fkey,
  drop constraint staff_manager_id_fkey,
  drop constraint staff_created_by_fkey,
  drop constraint staff_updated_by_fkey;

alter table public.staff
  add constraint fk_staff_discipline foreign key (tenant_id, primary_discipline_id) references public.disciplines(tenant_id, id) on delete restrict,
  add constraint fk_staff_office foreign key (tenant_id, primary_office_id) references public.office_locations(tenant_id, id) on delete restrict,
  add constraint fk_staff_manager foreign key (tenant_id, manager_id) references public.staff(tenant_id, id) on delete restrict,
  add constraint fk_staff_created_by foreign key (tenant_id, created_by) references public.staff(tenant_id, id) on delete restrict,
  add constraint fk_staff_updated_by foreign key (tenant_id, updated_by) references public.staff(tenant_id, id) on delete restrict;

-- 2.2. clients
alter table public.clients
  drop constraint clients_created_by_fkey,
  drop constraint clients_updated_by_fkey;

alter table public.clients
  add constraint fk_clients_created_by foreign key (tenant_id, created_by) references public.staff(tenant_id, id) on delete restrict,
  add constraint fk_clients_updated_by foreign key (tenant_id, updated_by) references public.staff(tenant_id, id) on delete restrict;

-- 2.3. client_contacts
alter table public.client_contacts
  drop constraint client_contacts_client_id_fkey,
  drop constraint client_contacts_created_by_fkey,
  drop constraint client_contacts_updated_by_fkey;

alter table public.client_contacts
  add constraint fk_cc_client foreign key (tenant_id, client_id) references public.clients(tenant_id, id) on delete restrict,
  add constraint fk_cc_created_by foreign key (tenant_id, created_by) references public.staff(tenant_id, id) on delete restrict,
  add constraint fk_cc_updated_by foreign key (tenant_id, updated_by) references public.staff(tenant_id, id) on delete restrict;

-- 2.4. jobs
alter table public.jobs
  drop constraint jobs_client_id_fkey,
  drop constraint jobs_job_type_id_fkey,
  drop constraint jobs_status_id_fkey,
  drop constraint jobs_risk_tier_id_fkey,
  drop constraint jobs_project_director_id_fkey,
  drop constraint jobs_design_manager_id_fkey,
  drop constraint jobs_primary_office_id_fkey,
  drop constraint jobs_created_by_fkey,
  drop constraint jobs_updated_by_fkey;

alter table public.jobs
  add constraint fk_jobs_client foreign key (tenant_id, client_id) references public.clients(tenant_id, id) on delete restrict,
  add constraint fk_jobs_type foreign key (tenant_id, job_type_id) references public.job_types(tenant_id, id) on delete restrict,
  add constraint fk_jobs_status foreign key (tenant_id, status_id) references public.job_statuses(tenant_id, id) on delete restrict,
  add constraint fk_jobs_risk_tier foreign key (tenant_id, risk_tier_id) references public.risk_tiers(tenant_id, id) on delete restrict,
  add constraint fk_jobs_pd foreign key (tenant_id, project_director_id) references public.staff(tenant_id, id) on delete restrict,
  add constraint fk_jobs_dm foreign key (tenant_id, design_manager_id) references public.staff(tenant_id, id) on delete restrict,
  add constraint fk_jobs_office foreign key (tenant_id, primary_office_id) references public.office_locations(tenant_id, id) on delete restrict,
  add constraint fk_jobs_created_by foreign key (tenant_id, created_by) references public.staff(tenant_id, id) on delete restrict,
  add constraint fk_jobs_updated_by foreign key (tenant_id, updated_by) references public.staff(tenant_id, id) on delete restrict;

-- 2.5. job_offices
alter table public.job_offices
  drop constraint job_offices_job_id_fkey,
  drop constraint job_offices_office_location_id_fkey;

alter table public.job_offices
  add constraint fk_jo_job foreign key (tenant_id, job_id) references public.jobs(tenant_id, id) on delete cascade,
  add constraint fk_jo_office foreign key (tenant_id, office_location_id) references public.office_locations(tenant_id, id) on delete cascade;

-- 2.6. job_disciplines
alter table public.job_disciplines
  drop constraint job_disciplines_job_id_fkey,
  drop constraint job_disciplines_discipline_id_fkey;

alter table public.job_disciplines
  add constraint fk_jd_job foreign key (tenant_id, job_id) references public.jobs(tenant_id, id) on delete cascade,
  add constraint fk_jd_discipline foreign key (tenant_id, discipline_id) references public.disciplines(tenant_id, id) on delete cascade;

-- 2.7. job_phases
alter table public.job_phases
  drop constraint job_phases_job_id_fkey,
  drop constraint job_phases_created_by_fkey,
  drop constraint job_phases_updated_by_fkey;

alter table public.job_phases
  add constraint fk_jp_job foreign key (tenant_id, job_id) references public.jobs(tenant_id, id) on delete restrict,
  add constraint fk_jp_created_by foreign key (tenant_id, created_by) references public.staff(tenant_id, id) on delete restrict,
  add constraint fk_jp_updated_by foreign key (tenant_id, updated_by) references public.staff(tenant_id, id) on delete restrict;

-- 2.8. job_scopes
alter table public.job_scopes
  drop constraint job_scopes_phase_id_fkey,
  drop constraint job_scopes_created_by_fkey,
  drop constraint job_scopes_updated_by_fkey;

alter table public.job_scopes
  add constraint fk_js_phase foreign key (tenant_id, phase_id) references public.job_phases(tenant_id, id) on delete cascade,
  add constraint fk_js_created_by foreign key (tenant_id, created_by) references public.staff(tenant_id, id) on delete restrict,
  add constraint fk_js_updated_by foreign key (tenant_id, updated_by) references public.staff(tenant_id, id) on delete restrict;

-- 2.9. job_components
alter table public.job_components
  drop constraint job_components_scope_id_fkey,
  drop constraint job_components_created_by_fkey,
  drop constraint job_components_updated_by_fkey;

alter table public.job_components
  add constraint fk_jc_scope foreign key (tenant_id, scope_id) references public.job_scopes(tenant_id, id) on delete cascade,
  add constraint fk_jc_created_by foreign key (tenant_id, created_by) references public.staff(tenant_id, id) on delete restrict,
  add constraint fk_jc_updated_by foreign key (tenant_id, updated_by) references public.staff(tenant_id, id) on delete restrict;

COMMIT;
