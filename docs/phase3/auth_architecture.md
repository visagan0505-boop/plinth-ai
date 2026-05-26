# Auth Architecture

## Core Providers
- **Identity Provider**: Supabase Auth (GoTrue). Handles passwords, MFA, sessions, and PKCE OAuth flows.
- **Operational Identity**: The `public.staff` table maps `auth.users.id` to an operational actor scoped to a `tenant_id`.

## Division of Responsibilities
1. **Supabase Auth (`auth.users`)**: Strictly for authentication (who the user is).
2. **Plinth Public Schema (`public.staff`, `public.tenants`)**: Strictly for authorization and operational context (what tenant they belong to, their billing rate, their engineering role).

## Future Considerations
- Single Sign-On (SAML/SSO) for enterprise clients.
- Multi-tenant mapping (e.g., consultants who belong to multiple tenants). For now, a 1:1 mapping between `auth.users` and `tenants` is enforced via JWT claims.
