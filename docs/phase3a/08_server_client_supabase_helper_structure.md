# Server/Client Supabase Helper Structure

## Directory Pattern

```text
src/lib/supabase/
├── client.ts       # Browser singleton (createBrowserClient)
├── server.ts       # Server-side cookies (createServerClient)
├── middleware.ts   # Next.js Edge routing cookies
└── admin.ts        # Service role client (Bypasses RLS - DANGEROUS)
```

## The Admin Client (`admin.ts`)
- Initialized using `SUPABASE_SERVICE_ROLE_KEY`.
- Bypasses all Row-Level Security.
- **Strict Rule**: Can only be imported inside protected internal API routes, Webhooks, or Edge Functions. It must never be imported in standard Server Actions or Server Components used for UI rendering to prevent accidental data leaks.

## Type Extraction Helpers
```text
src/lib/supabase/types.ts
```
Contains utility types extracted from the generated `Database` interface (e.g., `Tables<'jobs'>`, `Enums<'job_status'>`) to ensure clean imports throughout the frontend codebase without repeating complex generic constraints.
