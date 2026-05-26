# RAG Retrieval Architecture

## RAG Retrieval Boundaries
Retrieval-Augmented Generation (RAG) in Plinth operates strictly within operational context. Generalized queries (e.g., "Write a marketing email") are outside the boundary. Retrieval is limited to: Job operational context, financial summaries, staffing allocations, and engineering lessons learned.

## Engineering-Domain Retrieval Semantics
Vector embeddings must be tuned for engineering consultancy semantics. Words like "revision", "consent", "RFI", "variation", and "defect" carry heavy operational risk weight. Retrieval mechanisms will rank semantic matches higher if they intersect with known high-risk terminology in the domain glossary.

## Confidence-Aware Retrieval
Every retrieved chunk must carry an intrinsic confidence and freshness score. An operational note from 2021 regarding a client's billing preferences has lower semantic weight than an invoice issued to that same client last week. 

## Retrieval-Source Attribution
LLM generation without strict attribution is strictly forbidden. The RAG architecture demands that any context injected into the prompt carries a metadata payload (e.g., `source_entity: time_entry_123`). The AI's final output MUST physically cite these sources, allowing the human to click through to the operational ledger to verify the AI's claim.
