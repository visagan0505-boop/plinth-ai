# Route Protection Strategy

## Middleware-Driven Security

Next.js `middleware.ts` acts as the primary gatekeeper for the application.

### Protection Rules
1. **Unauthenticated Users**: 
   - Attempting to access `/dashboard`, `/jobs`, or `/time` redirects to `/login`.
2. **Authenticated Users**:
   - Attempting to access `/login` or `/register` redirects to `/dashboard`.
3. **Onboarding Enforcement**:
   - If `staff` metadata shows onboarding is incomplete, redirect all operational routes to `/onboarding`.

### Supabase SSR Middleware Pattern
The middleware must call `supabase.auth.getUser()`. This ensures the session is validated against the Supabase server (preventing forged JWT attacks) and handles token refreshes automatically.
