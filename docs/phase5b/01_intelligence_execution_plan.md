# Intelligence Execution Plan

## Implementation Order
The physical execution of the Intelligence Layer (Phase 5) must follow a strictly layered progression from deterministic read models to heuristic risk scoring:
1. **Event Pipeline Execution:** Implementation of the telemetry consumer listening to `domain_events`.
2. **Analytical Read Models:** Instantiating the scheduled or materialized aggregations for fast intelligence querying.
3. **Utilisation Analytics Engine:** Building the deterministic staffing capacity models based on the read layer.
4. **Operational Forecasting Engine:** Building the fee-burn trajectory predictors.
5. **Delivery Risk Engine:** Combining qualitative (NLP) and quantitative heuristics into an aggregated risk score.
6. **AI Assistant Boundary:** Defining the structural LangChain/OpenAI function schemas for strictly bounded analysis.

## Dependency Graph
- **AI Assistant** depends entirely on the **Risk**, **Forecasting**, and **Utilisation** engines.
- **Risk**, **Forecasting**, and **Utilisation** engines depend entirely on the **Analytical Read Models**.
- **Analytical Read Models** depend entirely on the **Event Pipeline** and the transactional **Phase 4 Financial Models**.

## Analytical Rollout Sequencing
Initial rollout will utilize dynamic, on-the-fly aggregation via Supabase RPCs/Server Actions. Once volume scales, the architecture supports transitioning to materialized views or an external warehouse (e.g., Snowflake) fed by the Event Pipeline.

## Operational Risk Boundaries
The intelligence system operates on a parallel, read-only analytical plane. Any failure, hallucination, or crash in the Intelligence Layer MUST NOT degrade the operational CRUD or financial transaction capabilities established in Phases 3 and 4.

## Validation Stages
- **Stage 1 (Pipeline):** Validate event ingestion without data loss.
- **Stage 2 (Aggregation):** Validate read models exactly match transactional source of truth.
- **Stage 3 (Forecasting):** Validate temporal replay (e.g., predict the end of a completed job using only its first 4 weeks of data).
