# Intelligence Data Contracts

## Authoritative Data Sources
The Intelligence Layer may only consume data from the transactional PostgreSQL layer (via Supabase) utilizing strict DTOs. Direct database scraping or bypassing the DTO structure is forbidden.

## Immutable Intelligence Inputs
Models are fed strictly from immutable entities:
- `domain_events`
- `invoices` (once `ISSUED`)
- `time_entries` (once `APPROVED`)
- `jobs` (active state changes)

## Aggregation Contracts
Because the underlying data is vast, the intelligence layer relies on strict aggregation contracts (e.g., `JobProfitabilitySnapshot`, `StaffUtilisationWindow`). The transactional services (built in Phase 4) are responsible for performing the mathematical aggregation; the intelligence layer consumes the structured result.

## Replay Compatibility
All intelligence contracts must support temporal `asOfDate` parameters. This allows the intelligence layer to request the state of the business precisely as it existed at any point in the past.

## Historical Replay Guarantees
Because `snapshot_cost_rate` and `snapshot_bill_rate` are permanently locked at the time of entry, the intelligence contracts guarantee that historical replays will return mathematically identical results regardless of current staff pay rises or rate card changes.
