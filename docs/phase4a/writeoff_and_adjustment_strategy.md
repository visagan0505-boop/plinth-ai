# Writeoff and Adjustment Strategy

## Adjustment Semantics
Directly updating or deleting a formally `APPROVED` time entry or an `ISSUED` invoice is absolutely forbidden. To correct financial records, an explicitly audited **adjustment** workflow must be used.

## Append-Only Adjustments
- **Contra-Entries:** If 10 hours were mistakenly entered and approved, the correction is to insert a new time entry for `-10 hours`, fully audited, rather than deleting the original row.
- **Credit Notes:** If an invoice was issued with incorrect values, it must be neutralized via an explicit adjustment entity (e.g., a credit note), preserving the original invoice state.

## WIP Writeoffs
- A "write-off" occurs when unbilled WIP cannot be invoiced (e.g., the job hit its fee cap and the remaining operational effort is absorbed by the consultancy).
- Writeoffs do not delete the time entries. The time entries remain part of the *Operational Cost* calculation.
- Instead, the unbilled WIP is formally re-categorized (e.g., marked as `WRITTEN_OFF`), ensuring the `snapshot_cost_rate` still burdens the job's profitability, thus reflecting the true margin hit.
