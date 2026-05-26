# Staff Operational Lifecycle

## Operational Staff Lifecycle States
- **ACTIVE**: The staff member is currently employed and can be assigned to jobs, log time, and appear in standard lookup dropdowns.
- **INACTIVE**: The staff member has left the practice or is on indefinite leave. They cannot be assigned to new jobs or log new time, but their historical records remain fully intact.

## Allowed Lifecycle Transitions
- `ACTIVE -> INACTIVE` (Deactivation / Offboarding)
- `INACTIVE -> ACTIVE` (Re-hire / Return from leave)

## Historical Attribution Guarantees
- A staff member's UUID acts as a permanent historical anchor across the operational database.
- Even if a staff member becomes `INACTIVE`, all their previous attributions (e.g., `created_by`, `updated_by`, job assignments, timesheets) remain perfectly preserved and resolvable.

## Deactivation Semantics
- Deactivation is purely a state mutation: `UPDATE public.staff SET is_active = false`.
- Any active relationships (e.g., current job management) should theoretically be transitioned by operational process before or immediately after deactivation, but the database will not forcibly remove the deactivated staff member from existing historical associations.

## Forbidden Destructive Operations
- `DELETE FROM public.staff` is strictly forbidden under all circumstances. It would cascade and destroy historical domain events, client contacts, and engineering records, violating the immutability of past reality.

## Temporal Truth Preservation Requirements
- Updates to `hourly_cost_rate` or `hourly_bill_rate` on the `staff` table represent the *current* operational reality. (Note: in a fully temporal schema, these would append to `staff_rate_periods`, but per our Phase 1 schema, they are stored directly on the staff row). We must preserve the exact value sent by the UI without retroactive modification of past invoices or timesheets (which store their own snapshot of rates).

## Operational Continuity Guarantees
- If the sole Director (the bootstrapper) attempts to deactivate themselves, the UI and API should ideally block it unless another active Director exists, guaranteeing there is always at least one operational administrator.
