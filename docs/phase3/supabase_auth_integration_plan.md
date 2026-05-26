# Supabase Auth Integration Plan

## Client Architecture
We will use `@supabase/ssr` to ensure secure handling of authentication across Server-Side Rendering (SSR) environments in Next.js.

### 1. Server Client
Used in Next.js Middleware, Server Actions, and Server Components.
- Reads/Writes cookies safely.
- Essential for route protection.

### 2. Browser Client
Used in Client Components (e.g., React forms).
- Reads cookies.
- Executes `signInWithPassword`, `signOut`, etc.

## Session Management
- **PKCE Flow**: Enforced for all sign-ins.
- **Middleware Refresh**: The Next.js middleware will proactively refresh expired access tokens by catching them on page loads.

## No Local State Duplication
- We will rely purely on the Supabase session as the source of truth for "is logged in".
- No Redux or Zustand stores for authentication state, avoiding desync issues.
