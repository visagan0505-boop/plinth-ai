# Operational Context Window Strategy

## Guarding the Context Window
The LLM context window is the most sensitive boundary in the intelligence architecture. Injecting garbage data or irrelevant history destroys the AI's ability to reason about operational truths.

## Operational Context Assembly Rules
Context assembly is strictly gated:
1. **Identity & Tenancy:** The window is strictly bound to the `tenant_id` of the requesting user. Cross-tenant leakage is a catastrophic security failure.
2. **Relevance Filtering:** Only active jobs, recent domain events (last 90 days), or explicitly highly-ranked semantic matches are included.
3. **Deterministic Primacy:** The prompt format always places deterministic financial aggregates at the top of the context window as indisputable facts, placing semantic RAG notes at the bottom as "contextual theories."

## Temporal Context Preservation
If a user asks about a past event, the context window assembly must filter out any operational data created *after* the target temporal boundary to prevent the AI from reasoning with future knowledge.

## Context Length Economics
To maintain high-speed, cost-effective reasoning, Plinth relies on the Phase 5 Analytical Read Models. Instead of injecting 1,000 raw time entries into the prompt, the system injects the single `job_analytical_snapshot` summarizing those entries, supplemented only by the 5 most semantically relevant text notes.
