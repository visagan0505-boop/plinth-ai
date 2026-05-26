# Onboarding Error State Matrix

| Scenario | State | Resolution / Action |
|----------|-------|---------------------|
| DTO Validation Fails | Client-side Error | Return `{ error: 'ZodValidationFailed' }` to UI. No DB interaction. |
| User not logged in | Auth Error | Redirect to `/login`. |
| User already has `tenant_id` | Conflict | Return `{ status: 'AlreadyOnboarded' }`. Redirect UI to `/dashboard`. |
| Tenant Slug is taken | DB Conflict | Return `{ error: 'SlugUnavailable' }`. Ask user for new slug. |
| Database Connection Drops mid-RPC | Safe Rollback | The PL/pgSQL transaction aborts. The state remains clean. User can retry safely. |
| GoTrue Admin API fails (JWT Update) | Partial Failure | The tenant exists, but the user's JWT lacks `tenant_id`. User is blocked at `/onboarding`. |
| JWT Propagation Error Recovery | Auto-Heal | On page load, `middleware.ts` forces a token refresh via `supabase.auth.getUser()`. The Supabase hook will auto-inject the `tenant_id` dynamically on token refresh, healing the session. |
