# Staff CRUD Execution Plan

## Sequence of Operations

1. **DTO Definition (`src/lib/dtos/staff.ts`)**
   - Create `CreateStaffSchema` and `UpdateStaffSchema`.
   - Ensure rate and role constraints match the domain.

2. **Service Layer Setup (`src/lib/services/staff.ts`)**
   - Implement `createStaff`, `updateStaff`, `listStaff`, `deactivateStaff`.
   - Ensure RLS clients are utilized to inject `created_by` / `updated_by`.

3. **Server Action Implementation (`src/app/actions/staff.ts`)**
   - Wrap the services with Next.js Server Actions.
   - Enforce operational context extraction and Zod parsing.

4. **Testing & Validation (No UI)**
   - Verify the typing of actions and service functions against `Database['public']['Tables']['staff']`.
   - Ensure temporal rate fields (`hourly_cost_rate`, `hourly_bill_rate`) are updated correctly.
