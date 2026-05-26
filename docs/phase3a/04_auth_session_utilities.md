# Auth Session Utilities

## Objective
Provide robust server-side utilities to extract and validate the operational context of the current user.

## Core Utilities (`src/lib/auth/session.ts`)

1. `requireAuth()`
   - A server-side utility that guarantees a valid session. If no session is found, it throws a standard error or triggers a Next.js `redirect('/login')`.

2. `getOperationalContext()`
   - Wraps `requireAuth()`.
   - Parses the JWT `app_metadata` to extract `tenant_id`.
   - Returns a strongly-typed object: `{ user_id, tenant_id, role }`.
   - Throws `TenantConfigurationError` if the JWT is missing the `tenant_id` claim, enforcing our failure recovery paths.

## Usage Rule
All operational Server Actions and API Routes MUST begin by calling `getOperationalContext()` before executing any business logic.
