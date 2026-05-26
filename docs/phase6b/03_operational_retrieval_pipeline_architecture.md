# Operational Retrieval Pipeline Architecture

## Retrieval Orchestration
Retrieval is a strict, multi-stage pipeline:
1. **Deterministic Filter:** Retrieve exact metrics (Profitability Snapshot) for the requested job.
2. **Semantic Expansion:** Generate vector from user query (e.g., "Why is this job failing?") and search time entry embeddings linked to that specific `job_id`.
3. **Synthesis:** Combine the deterministic math + semantic notes into the prompt payload.

## Deterministic Source Prioritization
In the final assembled context, deterministic math ALWAYS sits above semantic retrieval. The LLM system prompt mandates: "You must favor the provided financial metrics over any text notes."

## Retrieval Ranking
Search results are re-ranked based on operational severity. A text note containing "revision" or "rework" is artificially boosted in rank over a note saying "attending general meeting" because it carries higher financial risk density.

## Event Lineage Retrieval
If the query involves an anomaly, the pipeline retrieves the `domain_events` trace. (e.g., "Invoice issued on Monday, reversed on Tuesday, WIP written off on Wednesday").

## Hybrid Deterministic + Semantic Retrieval
The pipeline guarantees that if a user searches for "Structural engineering risks on Job 123", the vector search is hard-filtered by `job_id = 123` and `discipline = Structural` BEFORE semantic distance is calculated, guaranteeing zero hallucination from other jobs.
