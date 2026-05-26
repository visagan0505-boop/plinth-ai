# WIP and Drawdown Strategy

## Work-in-Progress (WIP) Operational Semantics
WIP represents the accumulation of approved time entries that have not yet been billed to the client. 
- **Accumulation:** When a time entry reaches the `APPROVED` state, its `hours * snapshot_bill_rate` adds to the unbilled WIP balance of the job.
- **Consumption (Drawdown):** When an invoice is generated, the WIP is formally "drawn down" against the job's `fee_value`.

## Fee Consumption Rules
- **Proportional Drawdown:** An invoice consumes a specific portion of the available fee budget.
- **Overburn Visibility:** If WIP exceeds the remaining fee budget, the job is in "overburn." The system does not block time entry, but flags the variance.
- **Fixed vs Hourly Logic:** While engineering consultancies often use fixed fees, the operational WIP is always calculated based on the underlying hourly burn to reveal true operational health.

## Temporal State
WIP is calculated dynamically based on time entries matching `operational_date <= [Report Date]` and `status = 'APPROVED'` and `invoiced = false`.
