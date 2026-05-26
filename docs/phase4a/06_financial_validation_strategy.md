# Financial Validation Strategy

## Overview
Given the mathematical authority of the Phase 4A implementation, the validation strategy relies heavily on automated deterministic assertions against the service layer.

## Reconstruction Testing
- Test that querying job profitability at time T1 (before an invoice) and T2 (after an invoice) yields mathematically precise results.
- Test that updating a staff member's current cost rate does *not* alter the profitability calculation of historical jobs.

## Financial Integrity Validation
- Validate that `DRAFT` invoices do not affect realized revenue.
- Validate that `ISSUED` invoices lock their line items structurally.
- Validate that generating an invoice correctly flags the consumed `time_entries` as billed, removing them from the Unbilled WIP pool.

## Reconciliation Validation
- Validate the core formula: `(Realized Revenue + Unbilled WIP) - Operational Cost = Profit Margin`. 
- Generate a mock job, log time, issue partial invoices, write-off partial time, and assert that the mathematical equation holds true with 0 variance.

## Historical Replay Validation
- Assert that inserting a backdated time entry (e.g., entering time today for a date two months ago) correctly alters the historical profitability boundary for that past date, provided the period is not locked.

## Tenant Isolation Validation
- Assert that tenant A cannot query, aggregate, invoice, or drawdown WIP using time entries owned by tenant B.
- Assert that `public.generate_next_sequence` correctly maintains independent counters (e.g., `INV-2026-0001` for Tenant A and `INV-2026-0001` for Tenant B).
