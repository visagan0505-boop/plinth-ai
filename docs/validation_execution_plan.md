# Phase 2: Validation Execution Plan

## Objective
Execute a rigorous set of tests against the hardened PostgreSQL schema to ensure multi-tenant integrity, temporal data accuracy, event immutability, and sequence concurrency safety before any application-level code is introduced.

## Scope of Validation

The validation phase comprises six distinct test suites built using standard PostgreSQL constructs (e.g., pgTAP/PLpgSQL). These suites directly enforce the architectural constraints defined in our ADRs and Domain Glossary.

### 1. Tenant Isolation
**Target**: `tenants`, `jobs`, `clients`, `staff`
**Validation**:
- Users assigned to `tenant_id` A cannot read, update, or delete records belonging to `tenant_id` B.
- Row-Level Security (RLS) acts as a strict boundary.
- The `bootstrap` tenant functions properly for initial onboarding.

### 2. Temporal Integrity
**Target**: `staff_rate_periods`, `time_entries`
**Validation**:
- Rate periods for staff cannot have overlapping date ranges (`effective_from` / `effective_to`).
- Historical rates cannot be destructively overwritten.
- Past `time_entries` preserve the financial truth at the time they were recorded.

### 3. Sequence Concurrency Safety
**Target**: `tenant_sequences`
**Validation**:
- Generation of deterministic identifiers (e.g., Job Numbers: `YYYY-NNNN`) is atomic.
- Concurrent transactions requesting a sequence for the same tenant do not result in duplicate identifiers or race conditions.
- Sequences are strictly scoped to the tenant.

### 4. Event Integrity
**Target**: `domain_events`, `domain_events_2026`
**Validation**:
- Domain events are immutable. UPDATE and DELETE operations on `domain_events` are strictly rejected.
- Partitioning logic (e.g., `domain_events_2026`) functions correctly.
- Event payloads adhere to the Operational State Taxonomy (e.g., `job.status_changed`).

### 5. Migration Repeatability
**Target**: Schema and Migrations
**Validation**:
- Rollback mechanisms function safely without stranding data.
- Applying the schema multiple times (idempotency checks) does not result in errors or destructive overwrites of seeded lookups (e.g., `disciplines`, `job_statuses`).

### 6. Performance Baselines
**Target**: Analytical and Transactional Views
**Validation**:
- Establish `EXPLAIN ANALYZE` baselines for large cross-tenant index scans.
- Measure latency for fetching time entry blocks and joined operational intelligence metrics.

## Next Steps
Once these validation tests are executed and pass locally and in CI, the architecture will be fully verified against implementation drift. 
Following successful validation, we will proceed to **Phase 3**: Application Implementation, starting with Auth and Tenant Onboarding.
