# Environment Variable Strategy

To ensure migration safety and CI/CD compatibility, environment variables are strictly defined.

## Required Variables

```env
# Public Supabase variables (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Server-Side Only Variables (NEVER expose to browser)
# Used exclusively for admin tasks like inviting users or webhooks.
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Principles
- **No Hardcoding**: All endpoints must read from `NEXT_PUBLIC_SUPABASE_URL`.
- **Validation**: Next.js startup scripts or zod schemas should validate the presence of these keys. If they are missing, the build/dev server must fail immediately.
