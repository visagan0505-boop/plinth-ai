# Event Pipeline Execution Strategy

## Domain Event Ingestion Mechanics
The intelligence layer acts as a consumer of the `public.domain_events` table (created in Phase 2/3). It runs a periodic cursor (or real-time subscription via Supabase Realtime) tracking the `last_processed_event_id`.

## Append-Only Pipeline Semantics
The analytical consumer reads an event (e.g., `invoice.issued`), updates the appropriate analytical read models (e.g., increments Realized Revenue for that job's temporal bucket), and moves the cursor forward. It never modifies the transactional data.

## Replay Architecture
If a new intelligence model is introduced (e.g., we invent a new way to calculate "Revision Pressure"), the system can reset the event cursor to zero and replay the entire operational history through the new analytical transformation logic to back-populate the feature.

## Analytical Transformation Boundaries
The pipeline transforms highly nested JSON payloads from the event log into flat, strongly typed metrics suited for rapid dashboard querying and AI context window injection.

## Future Warehouse Synchronization
This exact same cursor-based event ingestion mechanic is what will eventually be used to stream Plinth data into external Enterprise Data Warehouses (Snowflake, AWS Redshift) using standard ETL tools like Fivetran.
