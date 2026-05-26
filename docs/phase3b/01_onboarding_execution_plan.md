# Phase 3B: Onboarding Execution Plan

## Sequence of Operations

1. **DTO Definition (`src/lib/dtos/onboarding.ts`)**
   - Create strictly typed Zod schemas mapping to `Database['public']['Tables']`.
   - Export corresponding inferred TypeScript types.

2. **Server Action Scaffolding (`src/app/actions/onboarding.ts`)**
   - Create `executeTenantOnboarding()` server action.
   - Inject the `requireAuth()` helper to guarantee a valid session (but missing `tenant_id`).

3. **Database Transaction Strategy (`src/lib/supabase/rpc/bootstrap-tenant`)**
   - Create a deterministic PL/pgSQL function or sequential backend queries using the Supabase Service Role client to execute the bootstrap inserts safely bypassing RLS (since the user doesn't have a `tenant_id` yet).

4. **JWT Injection Mechanism**
   - Implement the logic to update the user's `app_metadata` with the newly generated `tenant_id` via Supabase Admin Auth API.

5. **Error & Retry Logic**
   - Implement the retry loops and idempotent conflict handling for partial failure recovery.
