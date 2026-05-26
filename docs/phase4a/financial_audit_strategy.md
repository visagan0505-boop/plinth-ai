# Financial Audit Strategy

## Append-Only Financial Auditability
All financial state transitions are subject to strict, append-only logging. Updates to financial models (like moving an invoice from DRAFT to ISSUED) must be recorded in the `domain_events` table alongside the mutation.

## Operational Attribution Guarantees
- Every financial row (`invoices`, `adjustments`) MUST contain `created_by` and `updated_by` columns, directly mapped to the authenticated staff member executing the action.
- Null or systemic actor IDs are not permitted for user-driven mutations; system batch jobs must utilize a dedicated internal actor ID.

## Reconciliation Compatibility
- Operations must leave a clear paper trail (event sourcing). 
- If WIP disappears from a job, there must be a corresponding `INVOICE_ISSUED` or `WIP_WRITEOFF` event that mathematically accounts for the variance. 
- This guarantees external accounting systems can periodically reconcile against Plinth without detecting untracked variances.
