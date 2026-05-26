# Onboarding Server Action Architecture

## Action Contract
The server action is the exclusive entry point for mutations from the client to the database.

### `executeTenantOnboarding(data: TenantOnboardingDTO)`

1. **Authentication Check**: Ensure `supabase.auth.getUser()` succeeds. 
2. **Context Validation**: Check if the user already has a `tenant_id` in `app_metadata`. If so, abort immediately (Idempotency).
3. **Payload Validation**: Run `TenantOnboardingSchema.parse(data)`.
4. **Execution Delegation**: Call the secure onboarding service utility (using `SUPABASE_SERVICE_ROLE_KEY`).
5. **Session Refresh**: If successful, call `supabase.auth.refreshSession()` to force the browser to pick up the new JWT containing the `tenant_id`.

## Security Boundary
- The Server Action operates in a Node.js context, completely hiding the transactional logic from the browser.
- Uses `createAdminClient()` strictly for the database inserts because the user does not yet possess a `tenant_id` to satisfy RLS policies.
