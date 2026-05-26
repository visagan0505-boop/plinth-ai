# Profitability Calculation Architecture

## Critical Mathematics
Profitability is the most critical calculation in the system, anchoring the Intelligence Layer.

**Formula:**
`Profit Margin = (Realized Revenue + Unbilled WIP) - Total Operational Cost`

## Realized Revenue Calculations
Realized revenue strictly aggregates the total value of all `ISSUED` and `PAID` invoices linked to the job. `DRAFT` invoices do not contribute to revenue.

## Historical Cost Usage
Total Operational Cost strictly aggregates:
`SUM(hours * snapshot_cost_rate)`
across ALL time entries associated with the job (regardless of whether they are billable, invoiced, or unbilled). By strictly using `snapshot_cost_rate`, the historical truth of what the staff member cost the business on that specific `operational_date` is mathematically sealed.

## Reconstruction Mechanics
To query profitability at a specific historical point (e.g., "End of Q2 2025"):
1. Aggregate revenue from invoices where `issued_date <= 2025-06-30`.
2. Aggregate WIP and Cost from time entries where `operational_date <= 2025-06-30`.
This ensures temporal consistency without data degradation.

## Writeoff and Adjustment Integration
- **WIP Writeoffs:** Inserted as contra time-entries (`hours = -X`). This naturally reduces the unbilled WIP but requires an adjustment mapping to retain the cost basis if the time was still operationally spent. (Alternatively, the time entry is flagged as `unbillable` via an adjustment, maintaining cost but neutralizing WIP).
- **Credit Notes:** Deducted from Realized Revenue.

The Profitability Calculation engine strictly consumes these ledger entries to produce deterministic outputs.
