# Jobs CRUD Execution Plan

## Execution Order
1. **DTO Schemas (`src/lib/dtos/job.ts`)**: Map the Zod schemas ensuring constraints (fee >= 0).
2. **Number Generator (`src/lib/services/sequence.ts`)**: Build a dedicated service to wrap `generate_next_sequence()`.
3. **Query Services (`src/lib/services/job.ts`)**: Implement `listJobs` and `getJobById`.
4. **Mutation Services**: Build `createJob` and `updateJob`. `createJob` will orchestrate the sequence generator and insert the row in a transaction-like boundary.
5. **Server Actions (`src/app/actions/job.ts`)**: Connect the services to Next.js form handling, validating input securely via operational context.
6. **Audit & Event Integration**: Ensure `created_by` is passed, and push an event to `domain_events`.
7. **CRUD Integration Validation**: Write a validation script similar to Phase 3C.
