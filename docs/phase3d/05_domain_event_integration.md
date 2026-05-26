# Domain Event Integration

## The Mechanism
ADR 008 established a partitioned `domain_events` table for a centralized append-only event log.

## The Trigger
When a job is successfully created via the Service Layer, a subsequent call must be made to log the creation event:
- `event_type`: 'job.created'
- `entity_type`: 'job'
- `entity_id`: Job UUID
- `actor_id`: `userId`
- `payload`: Basic job snapshot `{ name, client_id, job_number }`

This establishes the start of the immutable timeline for the aggregate.
