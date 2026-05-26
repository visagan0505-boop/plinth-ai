# Supabase SSR Client Setup

## Objective
Establish a secure, type-safe method for instantiating Supabase clients across Server Components, Client Components, Server Actions, and Middleware.

## Implementation Details
We will create utility functions in `src/lib/supabase/`:

1. `server.ts`:
   - `createClient()`: Reads cookies using `next/headers`. Designed for Server Components and Server Actions.
   - Enforces `Database` types from `types/supabase.ts`.

2. `client.ts`:
   - `createClient()`: Reads cookies from the browser document. Designed for Client Components.
   - Uses singleton pattern to avoid re-instantiating the client on every render.

3. `middleware.ts`:
   - Special client that can both read and write cookies to silently refresh expired access tokens during the Next.js routing lifecycle.

## Type Safety
Every client instance MUST be instantiated with the generic type `createClient<Database>(...)`. Un-typed clients are strictly prohibited.
