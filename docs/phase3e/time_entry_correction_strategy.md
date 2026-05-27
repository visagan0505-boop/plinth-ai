# Time Entry Correction Strategy

This document establishes the governance for mutating existing time entries (corrections), ensuring that the operational telemetry remains a trustworthy record of truth.

## 1. Telemetry Correction Rules
- **Corrections are Factual Alignments**: Modifying a time entry is permitted strictly to align the record with historical truth (e.g., correcting a typo in hours, or moving hours logged to the wrong phase).
- **No Financial Adjustments**: A time entry must NEVER be modified to alter financial outcomes (e.g., reducing hours because a budget was blown). Time entries reflect effort; financial adjustments occur downstream in WIP/billing systems.

## 2. Editable vs Immutable Fields
- **Immutable Fields**: 
  - `id`, `tenant_id`, `created_at`, `created_by`. These represent the absolute inception of the record.
- **Editable Fields**: 
  - `job_id`, `phase_id`, `scope_id`, `component_id`: Can be corrected if the effort was misattributed.
  - `entry_date`: Can be corrected if logged on the wrong day.
  - `hours`: Can be corrected if the effort duration was inaccurate.
  - `is_billable`: Can be corrected if the nature of the work was misclassified.
  - `notes`: Always editable to improve narrative fidelity.

## 3. Correction Attribution Requirements
- Every correction MUST update the `updated_at` and `updated_by` fields using the current authenticated `staff_id`.
- The system must capture the identity of the person correcting the record, even if they are not the `staff_id` who performed the effort (in proxy scenarios).

## 4. Operational Audit Guarantees
- The telemetry correction event (`time_entry.updated`) MUST contain the new state of the time entry. This ensures downstream engines (Profitability, Risk) can recalculate their projections based on the corrected truth.

## 5. Historical Truth Preservation Rules
- If a correction occurs, the system does not overwrite the domain event history. The `domain_events` table serves as an append-only ledger. The original `time_entry.created` event and subsequent `time_entry.updated` events provide a complete audit trail of how the record mutated over time.

## 6. Correction Lifecycle Semantics
- Corrections are instantaneous. There is no "draft correction" or "pending correction" state. When a mutation service executes, the operational truth is immediately updated.

## 7. Forbidden Telemetry Mutations
- **Zeroing Out to Delete**: Setting `hours` to `0` as a proxy for deletion is forbidden. The DTO schemas enforce `hours > 0`. If an entry was completely erroneous, it must be deleted (if supported by policy) or appropriately flagged.
- **Future Reallocation**: Altering an entry's date to a point significantly in the future is forbidden by temporal constraints.
