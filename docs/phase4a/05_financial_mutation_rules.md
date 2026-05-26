# Financial Mutation Rules

## Forbidden Operations
- `DELETE` on any financial record (`invoices`, `adjustments`, `wip_ledger`).
- `UPDATE` on `time_entries` once `status = 'APPROVED'`.
- `UPDATE` on `invoices` once `status = 'ISSUED'`.
- `UPDATE` on historical rate snapshots (`snapshot_cost_rate`, `snapshot_bill_rate`).

## Append-Only Constraints
Financial corrections must exclusively utilize append-only adjusting entries. 
- To reduce an issued invoice, issue a Credit Note (Adjustment).
- To remove approved time from WIP, issue a Time Entry Adjustment (Contra-entry).

## Mutation Authorization Boundaries
All financial mutations must inherently pass `tenant_id` and the explicit `actor_id` (`userId`). Mutations must be encapsulated in service functions that enforce RLS. Raw database updates from the client are structurally rejected.

## Locked-Period Rules
Financial periods (e.g., closed accounting months) enforce a temporal lock. If `operational_date` or `issued_date` falls into a locked period, mutations (even append-only adjustments mapped to that date) are rejected. Adjustments must instead be logged in the current, open operational period, preserving the closed period's audit integrity.

## Reversal Semantics
Reversing an action means generating the exact inverse record.
- Reversing an entry of 10 hours at $100 creates an entry of -10 hours at $100.
- Both records remain forever queryable in the audit trail.

## Audit Event Requirements
Every financial state change (Invoice Drafted, Invoice Issued, WIP adjusted) MUST dispatch a `domain_event` capturing the exact payload of the change and the `actor_id`.
