# Engineering Knowledge Graph Strategy

## Connecting the Operational Silos
Plinth will incrementally structure its data into a lightweight operational Knowledge Graph. This maps relationships that are semantically difficult to query via SQL alone: e.g., `[Client A] -> [Jobs] -> [Phase: Concept] -> [Frequent Revisions] -> [Staff: Bob]`.

## Multimodal Engineering Intelligence Compatibility
While Plinth currently operates on text and ledgers, the Knowledge Graph is architected to eventually accept multimodal engineering data (e.g., linking a "Revision Pressure" event directly to an uploaded structural drawing or RFI PDF).

## Event Lineage Retrieval
The Knowledge Graph utilizes the `domain_events` table to traverse causal lineage. If an AI identifies a massive profitability write-off, it traverses the graph backwards: `Writeoff` -> `Delay in Invoicing` -> `Disputed Time Entries` -> `Client RFI Notes`.

## AI Recommendation Limitations
The Knowledge Graph provides context, not mandates. The AI can highlight a path in the graph (e.g., "Historically, jobs with Client A in the Concept phase have a 60% probability of revision overburn"), but it cannot autonomously increase the fee budget.
