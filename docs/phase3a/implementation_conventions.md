# Implementation Conventions

## Naming Conventions
- **Folders**: `kebab-case` (e.g., `components/auth-forms`).
- **Files**: `kebab-case.ts` for utilities, `PascalCase.tsx` for components.
- **Route Segments**: `kebab-case` (e.g., `/dashboard/time-entries`).
- **Route Groups**: `(parentheses)` (e.g., `(operational)`).

## Folder Conventions
- `src/app`: Strictly for Next.js routing, layouts, and pages. Minimal logic.
- `src/components`: UI components. Grouped by domain (e.g., `components/auth`, `components/jobs`).
- `src/lib`: Core utilities, helpers, and Supabase client instantiation.
- `src/types`: TypeScript definitions (including generated `supabase.ts`).

## Import Boundaries
- Code in `src/app` can import from `src/components` and `src/lib`.
- Code in `src/components` can import from `src/lib` but NEVER from `src/app`.
- Code in `src/lib` should remain pure and stateless; it NEVER imports from `src/components` or `src/app`.

## Typed Database Access Rules
- All database calls must use the generated `Database` type from `types/supabase.ts`.
- Avoid `any` or manual type assertions when querying Supabase.

## Server/Client Separation Rules
- Default to **Server Components**.
- Add `'use client'` strictly at the file level only when React hooks (`useState`, `useEffect`, `useContext`) or browser APIs are required.
- Do not pass non-serializable data (like functions or class instances) from Server to Client Components.

## Supabase Usage Rules
- Use `@supabase/ssr` exclusively. Do not use standard `@supabase/supabase-js` auth methods on the server without proper cookie handling.
- Client Components must use `createBrowserClient()`.
- Server Components, Actions, and API routes must use `createServerClient()`.

## RLS Safety Rules
- Trust the Database. Do not re-implement authorization checks in the UI or API routes if RLS handles it.
- Ensure the custom JWT `tenant_id` claim is present before executing tenant-scoped operations.

## Service Role Restrictions
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. 
- It must ONLY be used in secure backend environments (e.g., specific Edge Functions or internal Webhooks).
- It must NEVER be exposed to the client or used for standard data fetching.

## Server Action Conventions
- Place Server Actions in dedicated files (e.g., `actions.ts`) with the `'use server'` directive.
- Always validate inputs using `zod` before executing business logic.
- Always extract operational context (`getOperationalContext()`) as the first step to ensure the session is active.

## Error Handling Conventions
- Throw typed custom errors in `src/lib` (e.g., `TenantConfigurationError`).
- Use React Error Boundaries (`error.tsx`) in the `app` directory to catch and display unhandled errors gracefully.
- Do not expose raw database errors or stack traces to the user.
