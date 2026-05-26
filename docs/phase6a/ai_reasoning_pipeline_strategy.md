# AI Reasoning Pipeline Strategy

## Contextual Reasoning Assembly
When a user asks a complex operational question (e.g., "Why is our structural engineering division missing its profitability targets?"), the AI reasoning pipeline executes a strict multi-step orchestration:
1. **Deterministic Retrieval:** Query Phase 5 read models for structural division profitability and utilisation limits.
2. **Semantic Retrieval:** Query the vector index for time entry anomalies, lessons learned, and risk flags associated with structural jobs over the target period.
3. **Reasoning Synthesis:** The LLM cross-references the semantic text against the deterministic math.

## AI Reasoning Constraints
The LLM is strictly prompted to prioritize deterministic data. If the math says profitability is 20%, but a retrieved time entry note optimistically says "Under budget!", the LLM must declare the mathematical truth and note the discrepancy, never the reverse.

## Confidence-Aware Generation
The reasoning pipeline calculates a combined confidence score based on the source data's confidence and the semantic retrieval distance. If the pipeline cannot find statistically significant correlations, it must default to: "Insufficient operational data to determine a definitive root cause," rather than hallucinating a plausible sounding business excuse.
