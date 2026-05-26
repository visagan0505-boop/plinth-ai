# Sequence Generation Strategy

## The Mechanism
ADR 010 established a `generate_next_sequence(tenant_id, entity_type, year)` function inside PostgreSQL. 
It uses advisory locks internally: `pg_advisory_xact_lock`.

## The Flow
1. Server action validates DTO.
2. Action calls `generateSequence(db, context.tenantId, 'JOB')`.
3. The DB securely allocates `2026-0014` and returns it as a string.
4. Action merges this `job_number` into the Job payload.
5. Action calls `createJob()`.

## Burned Sequences
If `createJob()` fails (e.g. FK violation on `client_id`), the sequence `2026-0014` is permanently lost. This is a design feature, not a bug. Gaps in sequences are acceptable in exchange for atomic, lock-free operational performance.
