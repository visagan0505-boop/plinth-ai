# Operational Delivery Invariants

This document summarizes the unbreakable rules governing the entire Deliverables & Transmittals module.

1. **NO GENERIC STORAGE**: Files only exist as attached immutable payloads to Revisions.
2. **ISSUED IMMUTABILITY**: An issued revision can never be altered.
3. **TRANSMITTAL FINALITY**: A transmittal, once created, can never be modified or deleted.
4. **DERIVED REGISTERS**: Issue histories and document registers are always mathematically derived from the transmittal ledger, never manually maintained.
5. **OPERATIONAL ISOLATION**: All delivery entities are strictly bound to a `tenant_id` and `job_id`. Leaking documents across jobs or tenants is a critical failure.
6. **NO APPROVAL GATES**: The platform assumes the professional competence of the operator. If a user issues a transmittal, the system executes it. Workflow blockages (like multi-tier approval chains) are rejected in favor of post-action auditability.
