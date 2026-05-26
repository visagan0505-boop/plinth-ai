# AI Assistant Boundary Architecture

## Assistant Permissions
The eventual AI Assistant operates strictly with `READ_ONLY` permissions relative to the transactional database. It is granted access to query the Analytical Read Models and the Risk Engine outputs.

## Forbidden Mutations
The AI is structurally prevented from executing `INSERT`, `UPDATE`, or `DELETE` on operational tables (`jobs`, `time_entries`, `invoices`, `staff`).

## Deterministic Override Rules
If the AI is asked "What is the profitability of Job 123?", it MUST NOT attempt to calculate this itself via LLM math. It is strictly bounded to invoke a function tool (e.g., `get_job_profitability`) that returns the output of the Phase 4 deterministic engine. The AI merely formats and explains this output to the user.

## Explainability Requirements
Whenever the AI flags a risk (e.g., "Job 123 is at high risk of overburn"), it must explicitly cite the deterministic signals that triggered it (e.g., "Because the burn rate accelerated by 40% last week").

## Human-in-the-Loop Constraints
If an AI suggests an operational action (e.g., "You should write off 10 hours of WIP"), it can prepare the DTO payload, but a human must click the explicit "Approve Adjustment" button in the standard Plinth UI, ensuring the action is logged with the human's `actor_id` in the audit log.
