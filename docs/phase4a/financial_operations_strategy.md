# Financial Operations Strategy

## Core Purpose
The Phase 4A Financial Operations Foundation transitions the operational data (Staff, Jobs, Time Entries) into revenue visibility. It bridges the gap between logging work and realising revenue.

## Key Constraint: Operational Intelligence, Not Accounting
Plinth is built as the **operational intelligence infrastructure** for engineering consultancies. It explicitly avoids functioning as a general ledger, a tax engine, or a payroll system. The financial operations modelled here exist purely to calculate operational fee burn, job profitability, and Work-in-Progress (WIP) consumption. Actual tax calculations and general ledger reconciliations are delegated to external accounting software (e.g., Xero).

## Foundational Guarantees
- **Append-Only History:** Financial truth is immutable. Historical states, rates, and past invoices must never be overwritten.
- **Tenant-Safe Ownership:** Every financial entity (Invoice, Adjustment, WIP record) must strictly carry the `tenant_id` constraint to preserve Row-Level Security (RLS).
- **Temporal Truth:** Financial metrics are calculated based on when the work occurred (`operational_date`) and when the revenue was realized, independent of when the record was entered (`created_at`).
- **Reconstruction Capability:** Operations must be structurally sound to allow rebuilding the exact profitability state of a job as it appeared on any historical date.

## Future Intelligence Compatibility
This deterministic architecture ensures that the data naturally feeds into Phase 5 (Intelligence Layer) to support accurate forecasting, staff utilisation modeling, and AI-driven predictive fee burn alerts.
