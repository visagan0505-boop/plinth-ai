# Analytical Read Model Architecture

## Analytical Projections
The analytical read models project the highly normalized transactional database (jobs, phases, time entries, invoices) into denormalized, time-series friendly structures. Examples include `job_weekly_burn_summaries` and `staff_weekly_utilisation`.

## Replayable Aggregation Models
Because the core architecture relies on `snapshot_cost_rate` and explicit `operational_date` fields, all analytical models can be destroyed and entirely rebuilt from the ground up by replaying the transactional database. This ensures intelligence schema migrations are zero-risk.

## Temporal Aggregation Mechanics
Read models are chunked temporally (e.g., weekly buckets). A job's profitability is aggregated up to the Sunday of each week, allowing intelligence systems to rapidly query the trajectory curve (Week 1 -> Week 2 -> Week 3) without recalculating thousands of individual time entries on the fly.

## Snapshot Generation Strategy
Snapshots are generated via background cron jobs or triggered directly by major `domain_events` (e.g., `invoice.issued` forces a recalculation of the job's current financial snapshot).

## Warehouse Compatibility
The read models are designed to be structurally compatible with columnar analytical databases. The flattened schemas ensure that if Plinth exports data to BigQuery or Snowflake, the Intelligence layer queries remain structurally identical.
