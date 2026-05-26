# Tenant Onboarding Flow

## Process Steps

1. **User Registration**
   - User signs up via `/register` (Email/Password).
   - Supabase creates record in `auth.users`.

2. **Database Trigger (Bootstrap Phase)**
   - A PostgreSQL trigger on `auth.users` catches the insert.
   - For a completely new tenant sign-up, the system creates a new `public.tenants` record.
   - The system creates a `public.staff` record linking the `auth.users.id` to the new `tenant_id`.
   - *Note: If a user is being invited to an existing tenant, the invitation flow handles mapping them to the existing `tenant_id`.*

3. **JWT Claim Injection**
   - A Supabase Auth Hook (or custom RPC function called post-login) sets the custom JWT claim: `app_metadata: { tenant_id: <UUID> }`.
   - This ensures all future requests made by this user possess the `tenant_id` for RLS.

4. **Redirection**
   - User is redirected to `/onboarding/setup` to fill out their Office Locations, Disciplines, and initial Settings before accessing the main operational dashboard.
