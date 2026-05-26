# Protected Route Structure

## Layout-Driven Protection

Instead of repeating authentication checks in every page, we use Next.js Layouts.

```text
src/app/(operational)/layout.tsx
```

## Logic
1. The `(operational)` route group intercepts all core app paths.
2. `layout.tsx` is an async Server Component.
3. It calls `getOperationalContext()`.
4. If successful, it provides the context (like Tenant Name, Navigation Links) to the client components via standard props or React Context.
5. If unsuccessful, the user never renders the child components.

## RLS Consistency
Because `getOperationalContext()` guarantees a `tenant_id` exists in the JWT, any subsequent Supabase client calls made within the `(operational)` children will perfectly satisfy the database RLS policies.
