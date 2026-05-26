# Staff Mutation Flow

## The Lifecycle of a Request

1. **Client**: User submits a form (e.g., "Add Staff").
2. **Server Action**: 
   - `getOperationalContext()` -> Retrieves `tenantId` and `userId`.
   - `CreateStaffSchema.safeParse()` -> Validates input.
3. **Client Instantiation**: 
   - `createServerClient()` creates a user-scoped database connection.
4. **Service Execution**: 
   - Calls `createStaff(db, dto, userId)`.
   - Payload is mapped to Postgres columns. `created_by` and `updated_by` are set to `userId`.
5. **Database (RLS)**:
   - Supabase PostgREST receives the request with the user's JWT.
   - Postgres validates the `tenant_id` constraint via Row-Level Security.
6. **Return**:
   - The Server Action returns a success discriminanted union.
   - UI reflects the updated state (often paired with `revalidatePath()`).
