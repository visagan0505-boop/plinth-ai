# Middleware Architecture

## Objective
Secure operational routes and maintain session integrity using Next.js Middleware.

## Flow Logic
1. **Initialize Supabase**: Create the SSR client designed for middleware.
2. **Fetch User**: Call `supabase.auth.getUser()`. This inherently validates the token signature against the Supabase API and handles refresh token rotation.
3. **Route Categorization**:
   - `isAuthRoute`: Paths like `/login`, `/register`, `/auth/callback`.
   - `isOperationalRoute`: Paths like `/dashboard`, `/jobs`, `/time`.
4. **Enforcement Rules**:
   - If user is NOT logged in AND attempts `isOperationalRoute` -> Redirect to `/login`.
   - If user IS logged in AND attempts `isAuthRoute` -> Redirect to `/dashboard`.
   - Ensure the updated session cookies are returned in the response headers.

## Performance Considerations
Middleware runs on the Edge. We avoid heavy database queries here. We rely entirely on the JWT claims (`app_metadata.tenant_id`) fetched via `getUser()`.
