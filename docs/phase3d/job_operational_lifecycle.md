# Job Operational Lifecycle

## Operational Job Lifecycle States
Jobs may only exist in one of the following canonical states:
- `ENQUIRY`
- `FEE_PROPOSAL`
- `ACTIVE_DELIVERY`
- `CONSENT`
- `CONSTRUCTION`
- `CLOSEOUT`

## Allowed Lifecycle Transitions
Transitions generally move forward (e.g., `ENQUIRY` -> `FEE_PROPOSAL` -> `ACTIVE_DELIVERY`), but can revert if project requirements change. A job reaching `CLOSEOUT` is considered historically sealed for standard operations but can be reopened under explicit admin override.

## Job Numbering Governance
- The `job_number` is generated atomically on the server via `public.generate_next_sequence()`.
- It takes the format `YYYY-NNNN` (e.g., `2026-0001`).
- Once a job number is allocated to a Job, it is STRICTLY IMMUTABLE.
- Even if a Job is archived or entered by mistake, its number is burned and never re-allocated.

## Historical Attribution Guarantees
- The `created_by` and `updated_by` fields securely anchor the actor to every Job mutation.
- Status changes will concurrently dispatch an immutable event to the `domain_events` log, tracing exactly who changed a status and when.

## Archive Semantics
- Soft-deletions or "archiving" (should the UI support it) do not destroy the row.
- Typically, moving a job to `CLOSEOUT` effectively archives it from active view without needing an `is_active` toggle. 

## Forbidden Destructive Operations
- `DELETE FROM public.jobs` is absolutely forbidden.
- Destroying a Job would fatally orphan phases, scopes, timesheets, and invoices.

## Temporal Truth Preservation Requirements
- Historical details at the time of creation (e.g., agreed fee values) must be preserved unless an explicit, audited operational update (Variation) alters them.

## Operational Continuity Guarantees
- A Job cannot exist without a `project_director_id`. If a project director leaves the firm, their jobs must be operationally reassigned, but historical events mapping back to them remain intact.
