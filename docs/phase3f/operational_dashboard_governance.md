# Operational Dashboard Governance

## Operational Dashboard Purpose
The dashboard is strictly an operational visibility layer. Its purpose is to surface real-time, deterministic aggregations of the practice's current state (active staff, active jobs, pending timesheets) to facilitate day-to-day management. It is not an analytical engine or forecasting tool.

## Approved Operational Metrics
The dashboard is rigidly scoped to the following approved metrics:
- Active jobs count
- Active staff count
- Submitted time entries (pending approval)
- Approved time entries
- Total hours this week
- Total hours this month
- Utilisation snapshot (billable vs non-billable hours ratio)
- Fee value totals (sum of fee_value on active jobs)
- Recent operational activity feed (via `domain_events`)

## Data Freshness Expectations
Aggregations must execute synchronously against the primary database (Supabase/PostgreSQL) during the server rendering phase. Caching may be utilized by Next.js per-request, but no asynchronous materialised views or warehouse batching will be introduced at this stage.

## Aggregation Boundaries
Aggregations must be executed completely server-side via Supabase RPCs or chained standard queries. Data must be reduced before it crosses the network boundary to the client.

## Tenant Isolation Guarantees
All metric aggregations must strictly append `.eq('tenant_id', tenantId)` enforced by Row-Level Security. Cross-tenant aggregation is fundamentally impossible by design.

## Profitability Calculation Rules
While this dashboard calculates *utilisation* (billable vs total hours), it explicitly does NOT calculate real-time profitability (revenue minus cost rates). Such metrics belong in a dedicated financial intelligence module (Phase 4).

## Temporal Truth Requirements
All metrics must respect temporal bounds. "Total hours this month" relies strictly on the `operational_date` of the `time_entries` table, NOT the `created_at` timestamp.

## Forbidden Analytical Behavior
- Predictive analytics
- Trend forecasting (e.g., "expected hours next month")
- Data visualisations requiring advanced charting engines (e.g., heatmaps)
- AI summaries or generative insights
- Benchmarking (comparing staff against each other)

## Future Intelligence Compatibility Rules
The queries designed for this dashboard must be cleanly structured so they can eventually be ingested by the future Intelligence Layer (ADR 007) without structural refactoring.
