# Semantic Revision Intelligence Strategy

## The Cost of Revisions
In engineering consultancies, unstructured revisions (rework, client changes, RFIs) are the primary destroyers of profitability. Traditional ledgers capture the hours, but lose the "why".

## Semantic Operational Search
Plinth uses vector embeddings on the `notes` field of `time_entries`. It clusters semantic similarity across thousands of entries. If staff log notes like "fixing concrete specifications", "updating slab thickness", and "re-running beam calcs", the semantic engine clusters these as "Structural Revision Effort."

## Revision Intelligence Retrieval
The RAG pipeline retrieves these semantic clusters and overlays them onto the deterministic fee burn. The AI can then explain: "The 20% margin degradation in August was directly correlated to 150 hours of semantic revision effort logged against the structural foundation phase."

## Operational Context Assembly Rules
When summarizing revision intelligence, the AI must strictly assemble the context chronologically and group by discipline. It must never hallucinate a reason for revision; it strictly summarizes the text logged by the engineers in the operational ledger.
