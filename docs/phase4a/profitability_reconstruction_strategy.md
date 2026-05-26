# Profitability Reconstruction Strategy

## Critical Importance
Profitability reconstruction is the mathematical foundation for future intelligence, forecasting, and AI analysis. If modelled incorrectly, forecasting models will hallucinate, and historical benchmarking will fail.

## The Mathematical Foundation
**Job Profitability = Realized Revenue (Invoices) + Unbilled WIP - Operational Cost**

- **Realized Revenue:** The sum of all `ISSUED` and `PAID` invoice totals for the job.
- **Unbilled WIP:** The sum of `(hours * snapshot_bill_rate)` for all `APPROVED` but unbilled time entries.
- **Operational Cost:** The sum of `(hours * snapshot_cost_rate)` across ALL time entries (`APPROVED`, `BILLED`), anchoring exactly to the historical rate stored at the time of entry.

## Historical Rate Snapshot Usage
The absolute preservation of `snapshot_cost_rate` and `snapshot_bill_rate` on the `time_entries` table guarantees that if a staff member received a pay rise in 2025, reconstructing a 2024 job will mathematically yield the exact profit margin observed in 2024.

## Temporal Reconstruction
The architecture must allow passing an arbitrary `operational_date` boundary (e.g., `2026-03-31`) into the profitability service. The service will seamlessly slice the time entry ledger and invoice ledger to return the precise profitability state as it existed on that historical date.

## Future Intelligence Compatibility
By maintaining this strict append-only, temporally aware ledger, machine learning models can confidently train on historical job trajectory curves (e.g., how profitability degraded over the final 3 months of construction) without worrying about mutated or "updated in place" data corrupting the training set.
