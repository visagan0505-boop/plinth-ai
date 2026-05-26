# Intelligence Operational Workflows

## How Users Operationally Interact with Intelligence
Intelligence in Plinth is not a passive dashboard; it is an active operational catalyst. A "High Risk" score on a job should immediately prompt the user to drill down and execute a transactional correction (e.g., issuing an invoice, or adjusting WIP).

## Escalation Workflows
When a job breaches a critical threshold (e.g., Health Score < 50), the intelligence layer surfaces it to a global "Requires Attention" view. The operational workflow demands that a human reviews the flags and either acknowledges the risk or mitigates it.

## Human Review Requirements
No intelligence metric triggers an automated structural change. The system will never automatically write off WIP because an AI flagged it as unrecoverable. Human review is structurally mandated for all operational mutations.

## Actionability Constraints
Every risk flag must have an actionable resolution path. If the system flags "Billing Delay", the UI provides a direct link to the Job's invoice generation workflow.

## Operational Override Semantics
If the intelligence layer flags a "Revision Pressure" risk, but the Project Manager knows the client has agreed to a fee variation that hasn't been formalized yet, the UI must provide a way for the human to temporarily "mute" or acknowledge the flag, recording the human's override rationale in the audit log.
