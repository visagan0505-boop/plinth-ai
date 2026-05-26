# AI Context Assembly Engine

## Context Window Composition
The engine builds the LLM prompt payload systematically:
- **Block 1: System Mandates:** Strict instructions on hallucination limits and fallback responses.
- **Block 2: Deterministic State:** The JSON representation of the Job's current financial snapshot and risk score.
- **Block 3: Retrieved Context:** The top N semantic chunks (time entries, lessons learned) relevant to the query.
- **Block 4: The Query:** The user's specific request.

## Deterministic Injection Precedence
Block 2 (Deterministic State) is immutable. It is injected into the context window whether the user explicitly asks for it or not, ensuring the LLM is constantly grounded in the operational reality of the job in focus.

## Confidence-Aware Context Inclusion
If a semantic chunk has a low similarity score, the Context Engine wraps it in an explicit warning: `[LOW CONFIDENCE MATCH: Use with caution]`.

## Token Prioritization
If the context window fills up, the engine aggressively prunes Block 3 (Semantic Context). Block 2 (Deterministic State) is never pruned.

## Retrieval Attribution Assembly
Every semantic chunk injected into the prompt carries a metadata tag: `[SOURCE: time_entry_8891]`. The LLM is instructed to append these exact tags to any factual claim it makes in the output.
