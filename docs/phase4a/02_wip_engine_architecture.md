# WIP Engine Architecture

## Fee Consumption Mechanics
WIP (Work-in-Progress) is the measure of operational effort expended on a job that has not yet been invoiced.
- **WIP Value:** The sum of `hours * snapshot_bill_rate` for all `APPROVED` time entries that are not marked as invoiced.
- **Fee Value:** The contract `fee_value` assigned to the job.
- **Remaining Fee:** `fee_value - realized_revenue (invoiced amount)`.

## Approved Time Aggregation
The WIP engine only aggregates time entries in the `APPROVED` state. `DRAFT` or `SUBMITTED` entries represent unverified operational risk and are explicitly excluded from financial WIP to prevent premature drawdown panics.

## Billable vs Non-Billable Handling
- `is_billable = true`: Hours multiply by `snapshot_bill_rate` and contribute to unbilled WIP.
- `is_billable = false`: Hours multiply by `snapshot_bill_rate` of 0 for WIP purposes, but the `snapshot_cost_rate` still accumulates as operational cost for profitability.

## Drawdown Calculations
When an invoice is issued:
1. The invoice specifies a billing amount against the job.
2. Unbilled WIP is technically "drawn down" by this amount.
3. Because the system operates on an append-only ledger, the invoice mathematically reduces the unbilled WIP balance in the reporting layer without mutating the `time_entries` table directly. The time entries simply receive a `linked_invoice_id` to mark them as billed.

## Temporal Reconstruction Rules
WIP can be reconstructed for any historical date by querying:
- All `time_entries` where `operational_date <= [Date]`.
- Excluding any entries linked to invoices where the invoice `issued_date <= [Date]`.
