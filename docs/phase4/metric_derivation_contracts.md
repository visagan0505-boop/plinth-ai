# Metric Derivation Contracts

This document establishes the unyielding mathematical rules for deriving metrics within the platform. To maintain absolute operational trust, every metric must be perfectly explainable and entirely reproducible.

## 1. Permitted Derivation Sources
All intelligence must be derived from one of three immutable sources:
1. **The Telemetry Ledger** (`time_entries` table)
2. **The Transmittal Ledger** (`transmittals`, `transmittal_items` tables)
3. **The Revision Ledger** (`revisions` table)

## 2. Immutable Telemetry Derivation Rules
- A metric is a mathematical projection of the underlying facts at the time the query is run. 
- Example: "WIP Burn" is always derived as `SUM(time_entries.duration * staff.cost_rate)`. It is never stored as a static column like `total_burn_usd` that must be manually kept in sync.

## 3. Forbidden Analytical Derivations
- The platform prohibits speculative interpolation. We do not calculate "Estimated Time to Completion" (ETC) by guessing. 
- The platform prohibits fuzzy time. Metrics must use exact timestamps from the ledgers.

## 4. Temporal Replay Guarantees
- Because all ledgers (Time, Revisions, Transmittals) are immutable append-only structures, the system guarantees "Temporal Replay". 
- An analyst querying the metrics for `Q1 2026` in the year `2028` will receive the exact same mathematical output as they did on the last day of `Q1 2026`.

## 5. Operational Metric Explainability
- Every metric displayed on a dashboard must be "drillable" back to its source facts. 
- If the dashboard states "$4,000 burned on Phase A", the system must be able to list the exact time entries and cost rates that sum precisely to $4,000. There are no "black box" metrics.

## 6. Dashboard Analytical Integrity Guarantees
- Dashboards are strictly read-only aggregations. The UI layer cannot mutate the data to "fix" a metric. 
- If a metric is wrong, it means the underlying operational telemetry is wrong. The fix must be applied via an audited correction to the telemetry ledger itself, thereby recalculating the derived metric mathematically.
