# Operational Mutation Rules

## Mutation Execution Rules
- All database mutations must be executed strictly through Next.js Server Actions.
- Client components must never use `@supabase/ssr` `createBrowserClient()` for INSERT, UPDATE, or DELETE operations. They may only use it for real-time subscriptions or simple READ operations, though Server Components are heavily preferred for reads.

## DTO Validation Requirements
- Every mutation must receive a strongly-typed payload defined by a Zod schema (DTO).
- Server Actions must parse the payload using `.safeParse()` before any business logic executes.
- DTOs map 1:1 with business intent, not necessarily 1:1 with database tables.

## Audit Preservation Rules
- Operational CRUD mutations MUST track `created_by` and `updated_by`.
- The `userId` extracted from the operational context MUST be injected into these fields on every insert or update.
- System-level operations bypassing RLS (e.g., onboarding) are the only exceptions where audit fields may be null.

## Operational Context Requirements
- Server Actions must unconditionally call `getOperationalContext()` before processing.
- The `tenant_id` from the context must govern the logic. However, RLS provides the ultimate boundary guarantee.

## Forbidden Mutation Patterns
- Using `SUPABASE_SERVICE_ROLE_KEY` for standard CRUD operations is strictly forbidden.
- Soft-deletion via trigger is forbidden; the application must explicitly set `is_active = false`.
- Hard-deletion of operational entities (like Staff or Jobs) is forbidden.

## Service Layer Boundaries
- Server Actions handle HTTP layer concerns (Auth, Zod Validation, Form Errors).
- Actions delegate to a `Service` function (e.g., `createStaffMember()`) which executes the Supabase query.
- Services should be pure, accepting the context and DTO, returning typed data or throwing custom errors.

## RLS Preservation Requirements
- Service functions must use the user-scoped `createServerClient()`.
- RLS natively filters the `tenant_id` automatically, so we don't strictly need to append `.eq('tenant_id', tenantId)` on every update, but it is good practice for explicit intent.

## Server Action Conventions
- Must return a discriminated union of success/error states to the UI.
- Never leak raw PostgREST database errors to the frontend.
