# Time Entry Operational Lifecycle

## Operational Time Entry Lifecycle States
- **DRAFT**: Initial state when a staff member logs time. The entry is fully mutable by the owner.
- **SUBMITTED**: The staff member has submitted their timesheet for the period. Mutation is locked to the owner, pending review.
- **APPROVED**: A manager or director has reviewed and approved the time. The entry is locked for all standard mutations.
- **LOCKED**: The operational period (e.g., month-end accounting) has been sealed. The entry is strictly immutable to preserve financial integrity.

## Submission and Approval Semantics
- Submission operates in batches (typically weekly periods) but state is managed per entry.
- Approvals can be done atomically per entry or batched.
- Approvers must have higher authority (e.g., project director for job-specific time, or manager for general time).

## Historical Rate Attribution Guarantees
- Every time entry MUST snapshot the staff member's `hourly_cost_rate` and `hourly_bill_rate` at the moment of entry.
- If a staff member gets a pay raise or rate increase next month, the past time entries retain their exact snapshot, guaranteeing retroactive profitability calculations remain mathematically unchanged.

## Billing Integrity Guarantees
- Time entries marked as `billable = true` contribute to the job's WIP (Work In Progress).
- Once a time entry is invoiced, it mathematically cannot be altered. 

## Locked-Period Behavior
- A system-level locked period (e.g., "March 2026 is closed") supersedes any individual entry state.
- Even an admin cannot mutate a time entry falling within a locked operational date range without formally unlocking the period via an audited exception workflow.

## Forbidden Destructive Operations
- `DELETE` operations on time entries are strictly forbidden once they leave the `DRAFT` state. 
- To negate an approved time entry, a contra-entry (negative hours) must be created, preserving the audit trail of the mistake and the correction.

## Temporal Truth Preservation Requirements
- The `operational_date` (the day the work occurred) is decoupled from `created_at` (when it was entered into the system).
- Both temporal axes must be preserved accurately.

## Operational Continuity Guarantees
- If a staff member is deactivated, their approved time entries seamlessly continue to factor into job costings, fee burn, and historical profitability reporting.
