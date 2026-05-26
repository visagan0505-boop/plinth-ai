# Phase 3: Implementation Execution Plan

## Sequence of Operations

1. **Auth & Tenant Onboarding (Current Module)**
   - Setup Supabase Auth integrations.
   - Implement custom JWT claims for tenant ID.
   - Build out tenant registration and onboarding logic.
   - Setup minimal Next.js folder structure and route protection.

2. **Staff CRUD**
   - Read/Write logic for `public.staff`.
   - Managing staff roles and rate periods mapping.

3. **Jobs CRUD**
   - Implement Job scopes, phases, components.
   - Generation of deterministic job numbers using `tenant_sequences`.

4. **Time Entry Workflow**
   - High-performance grid or list for capturing `time_entries`.
   - Temporal integrity checks (effective rate matching).

5. **Minimal Operational Dashboard**
   - Read-only views for active jobs and recent time entries.

## Strict Principles
- **No UI generation yet.** Only define the architectural patterns.
- **Preserve Types**: All queries must use the generated `Database` types from Phase 1.
- **Single Module Focus**: We will not look at Staff CRUD until Auth & Onboarding is 100% verified.
