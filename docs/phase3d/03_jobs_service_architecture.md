# Jobs Service Architecture

## Pure Dependency Injection
Like Staff CRUD, Job Services will accept a `SupabaseClient` instance.

## Service Isolation
- `sequence.ts`: Responsible purely for executing Postgres RPCs to allocate safe sequence numbers.
- `job.ts`: Handles the relational insert. 
- The Server Action coordinates them. First allocating the sequence, then inserting the job. 

*Note: Since PostgREST processes sequentially in REST, if the job insert fails after sequence allocation, the sequence number is "burned", which is a completely acceptable accounting principle to avoid concurrency race conditions and blocking transactions.*
