# AI Execution Plan

## Implementation Sequencing
Physical implementation of the AI layer proceeds strictly sequentially:
1. **Vector Infrastructure:** Provision Postgres pgvector or an isolated vector store enforcing strict RLS.
2. **Indexing Pipelines:** Build background processors capturing `domain_events` into semantic embeddings.
3. **Retrieval Tooling:** Construct the bounded internal APIs (e.g., `getSemanticRevisionRisk`) to fetch deterministic + semantic context.
4. **Context Engine:** Implement the context window assembler.
5. **Orchestration Layer:** Embed LangChain / Vercel AI SDK strictly bounded by Zod-schema outputs.
6. **Tool Definitions:** Expose operational mutators with absolute "approval-required" interceptors.
7. **Explainability UI:** Render the trace outputs.

## Rollout Phases
- **Phase 1 (Shadow Mode):** AI executes in the background of active jobs, writing risk summaries to hidden logs purely for developer calibration.
- **Phase 2 (Advisory Mode):** AI summaries appear in UI, but tooling (action capability) is disabled.
- **Phase 3 (Copilot Mode):** AI can prepare DTOs (e.g., "Draft this invoice") for human submission.

## Dependency Boundaries
The AI layer sits at the extreme edge of the architecture. It depends entirely on the Intelligence Read Models (Phase 5) and the Operational Ledgers (Phase 3/4). If the AI layer is fully deleted, the business operations remain perfectly intact.

## Operational Safety Stages
No AI code is promoted to production without clearing deterministic math tests ensuring the AI cannot silently rewrite its retrieval context.

## Validation Gates
Each release requires an explicit "Hallucination Sweep" where the system is fed highly ambiguous operational data to verify it falls back to "Insufficient Data" rather than guessing.
