# Operational AI Memory Strategy

## Core Philosophy
Operational memory in Plinth is not a generalized LLM semantic search. It is a highly structured, replayable, and auditable repository of engineering consultancy history. The memory layer connects disparate operational truths—fee burn trajectories, staff utilization, revision pressures, and invoice lifecycles—into a cohesive intelligence fabric.

## Operational Memory Architecture
Operational memory is composed of two interacting planes:
1. **Deterministic Ledgers (The Truth):** The PostgreSQL transactional ledgers and intelligence read models (Phase 4 & 5).
2. **Semantic Memory (The Context):** Vector embeddings of text (time entry notes, job descriptions, lessons learned) mapped explicitly back to their authoritative deterministic source.

## Temporal Operational Memory Reconstruction
Memory is heavily temporal. If an AI is asked, "Why did Job 123 fail last year?", it must reconstruct the operational memory strictly as it existed during that timeframe. It aligns semantic retrieval (e.g., "rework on slab foundation" notes) with the deterministic snapshot (WIP spiked 40% in Week 6) to formulate an explainable hypothesis.

## Immutable Operational Truth Boundaries
AI memory is entirely derivative. It is reconstructed from `domain_events` and transactional state. If an AI memory seems incorrect, the system's architecture requires humans to correct the underlying operational transaction, which automatically triggers a downstream rebuild of the AI's semantic index.
