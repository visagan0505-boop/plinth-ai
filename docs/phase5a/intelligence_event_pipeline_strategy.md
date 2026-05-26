# Intelligence Event Pipeline Strategy

## Domain Event Usage
Plinth uses the `domain_events` table as the primary telemetry ingestion mechanism for intelligence. Every major operational mutation (e.g., Invoice Issued, Job Status Changed, Staff Deactivated) is logged here.

## Operational Telemetry Ingestion
Intelligence models (like anomaly detection) process the stream of domain events to detect behavioral patterns (e.g., a sudden flurry of time entries submitted at 2 AM, or a large invoice cancellation).

## Append-Only Analytical Pipelines
The event pipeline is strictly append-only. The intelligence layer reads from the tail of the event stream to update its analytical caches or feature stores.

## Future Warehouse Compatibility
By structuring all intelligence ingestion around explicit `domain_events` and versioned payloads, the platform guarantees future compatibility with external data warehouses (e.g., Snowflake, BigQuery) if the consultancy outgrows embedded intelligence.
