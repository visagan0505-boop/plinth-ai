# Operational Hierarchy Invariants

This document defines the strict guarantees that govern the operational decomposition hierarchy within the engineering workflow. These invariants must be maintained by the system at all times to ensure data integrity, operational realism, and cross-tenant isolation.

## 1. Hierarchy Integrity Guarantees
- **Acyclic Strict Containment**: A Component strictly belongs to one Scope. A Scope strictly belongs to one Phase. A Phase strictly belongs to one Job.
- **Top-Down Anchoring**: The root of the operational hierarchy is always a Job (`job_id`). Operational queries must always be anchorable back to the parent Job.
- **Dangling Record Prevention**: No Phase, Scope, or Component can exist without its respective parent. 

## 2. Parent/Child Operational Rules
- **Additive Isolation**: Child records (e.g., Components) aggregate their characteristics (like `estimated_hours`), but the system does not enforce strict parent-level locking during bottom-up summation. Aggregation is derived at the read level.
- **Status Cascade Limitation**: While physical deletion of a parent cascades to children, logical status updates (e.g., placing a Phase 'on_hold') do not modify the status fields of child scopes/components. Instead, business logic interprets children of an 'on_hold' phase as effectively paused.

## 3. Forbidden Hierarchy States
- **Cross-Job Assignment**: A Phase, Scope, or Component cannot be moved to a different Job once created. The `job_id`, `phase_id`, and `scope_id` are immutable after `INSERT`.
- **Dependency Loops**: Operational units are purely compositional. No "Component A requires Component B" state is allowed.

## 4. Cross-Tenant Isolation Guarantees
- **Implicit Tenant Leakage Prevention**: Every read, insert, update, or delete must enforce `tenant_id` at the database level via Row Level Security (RLS). The application code must never construct queries that cross tenant boundaries.
- **Lookup Integrity**: Foreign key constraints ensure that a job's phase cannot reference a status or risk tier belonging to another tenant.

## 5. Operational Decomposition Invariants
- **Fee Integrity**: `fee_amount` on Phases must always be `>= 0`. Negative fees are mathematically and operationally invalid.
- **Estimate Integrity**: `estimated_hours` must always be `>= 0`.
- **Inclusion Explicitness**: A Scope's `is_included` flag provides deterministic categorization for fee proposals. It defaults to true but can be explicitly flagged false for out-of-scope work.

## 6. Lifecycle Preservation Requirements
- **Immutability of History**: Changes to hours, fees, or status are tracked via the `updated_at` and `updated_by` columns. Historical context is preserved through the event system (future integration).
- **Soft Delete Bias**: The system supports cascading deletes solely as a cleanup safety net, but UI operations must encourage status mutations (e.g., Cancelled) instead of destructive physical deletions to preserve the lifecycle narrative.

## 7. Historical Continuity Guarantees
- **Audit Field Immutability**: The `created_by` and `created_at` fields are entirely immutable. The system rejects any attempts to update these fields after the initial insert.
- **Deterministic Traceability**: Any mutation to a Component, Scope, or Phase leaves an explicit trace identifying the staff member who made the change (`updated_by`).
