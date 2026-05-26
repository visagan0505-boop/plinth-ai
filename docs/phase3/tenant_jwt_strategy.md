# Tenant JWT Strategy

To maintain high performance and preserve RLS compatibility without requiring an extra database join on every query, we inject the `tenant_id` directly into the user's Supabase JWT.

## Injection Mechanism

We will use a Custom Supabase Auth Hook (specifically the `custom_access_token` hook) to map the `auth.users.id` to the `public.staff` table and append the `tenant_id` to the `app_metadata` field of the token.

### JWT Structure
```json
{
  "aud": "authenticated",
  "exp": 1716768000,
  "sub": "user-uuid-here",
  "email": "engineer@tenant.com",
  "app_metadata": {
    "provider": "email",
    "tenant_id": "tenant-uuid-here"   <-- INJECTED
  }
}
```

## RLS Enforcement
In the database, our previously established RLS policies read this claim:
```sql
CREATE POLICY "tenant_isolation" ON public.jobs
FOR ALL USING (
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id')::uuid
);
```
This guarantees operational isolation strictly at the database layer.
