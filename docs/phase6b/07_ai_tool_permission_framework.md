# AI Tool Permission Framework

## Allowed Tools
The LLM is granted explicit, bounded tools to pull additional context or prepare drafts:
- `queryJobProfitability(jobId)`
- `queryRecentTimeEntries(jobId, limit)`
- `draftInvoice(jobId, amount)`
- `draftAdjustment(jobId, hours)`

## Forbidden Tools
The LLM is absolutely forbidden from possessing direct execution tools:
- `executeInvoice()`
- `deleteTimeEntry()`
- `updateFeeValue()`

## Mutation Restrictions
Any tool that prepares a mutation (e.g., `draftInvoice`) merely constructs a JSON payload in memory. It cannot dispatch the payload to the database.

## Approval-Required Operations
When the LLM outputs a draft mutation payload, the Orchestration layer intercepts it and passes it to the UI as an "Action Card". The human user must review the payload and click "Approve" to physically execute the standard Server Action.

## Tool-Level Audit Logging
Every tool invocation by the LLM is logged in a dedicated `ai_tool_executions` table, tracking the parameters the LLM chose to pass and the deterministic result it received back.

## Operational Escalation Semantics
If the LLM attempts to use a tool excessively or with malformed parameters (e.g., trying to draft an invoice for -$50,000), the orchestrator immediately terminates the run and flags the conversation for administrator review.
