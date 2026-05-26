# Intelligence Architecture Strategy

## Intelligence System Boundaries
The Intelligence Layer in Plinth is strictly read-only relative to operational truth. It consumes deterministic financial data, operational activity, and lifecycle events, translating them into predictive, analytical, and analytical abstractions. It is explicitly separated from the operational mutation layer.

## Transactional vs Analytical Separation
Plinth adheres to CQRS (Command Query Responsibility Segregation) principles at the macro-architecture level. The transactional database (PostgreSQL via Supabase) guarantees strict RLS, append-only constraints, and immutable sequences. The analytical and intelligence layers are consumers of this data; they never write directly back into the transactional schema to bypass human-approved workflows.

## Operational Truth Sources
All intelligence models trace back to the deterministic foundation established in Phase 4:
- `snapshot_cost_rate` on time entries
- `APPROVED` time entries
- `ISSUED` / `PAID` invoices
- Append-only adjustments
- Domain events log

## Deterministic Intelligence Principles
Intelligence in Plinth is not a black-box LLM prompt. Before an AI analyzes a job, a deterministic algorithm calculates the absolute mathematical trajectory of the fee burn. Intelligence models enhance visibility (e.g., detecting anomalies in burn rates), but the numbers presented are always structurally provable.

## Future AI Orchestration Boundaries
Any future AI orchestration (e.g., LangChain, OpenAI functions) operates as an analytical proxy. The AI can pull structured data through defined DTO contracts and present hypotheses to the user, but the user must authorize any actual operational decisions.
