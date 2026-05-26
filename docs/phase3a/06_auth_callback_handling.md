# Auth Callback Handling

## Objective
Handle the PKCE OAuth or Email verification flow correctly and securely exchange authorization codes for active sessions.

## Implementation: `app/api/auth/callback/route.ts`
1. Receives the `code` and `next` query parameters.
2. Instantiates the Server Supabase Client.
3. Calls `supabase.auth.exchangeCodeForSession(code)`.
4. If successful, redirects the user to the `next` path (defaulting to `/dashboard`).
5. If unsuccessful, redirects to `/login?error=auth_failed`.

## Edge Cases
- **Missing Code**: Immediately redirect to `/login`.
- **Token Injection**: The session established here triggers the Supabase Hook, ensuring the `tenant_id` is present in the cookies written to the client.
