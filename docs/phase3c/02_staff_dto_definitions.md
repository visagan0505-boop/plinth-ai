# Staff DTO Definitions

## Principle
We separate creation logic from update logic. A new staff member must have an email, but an existing staff member's email cannot be easily changed without auth consequences.

## Schema Definitions

```typescript
import { z } from 'zod';

const RoleEnum = z.enum([
  'director', 'project_director', 'design_manager', 
  'senior_engineer', 'engineer', 'graduate', 
  'drafter', 'admin', 'finance'
]);

export const CreateStaffSchema = z.object({
  fullName: z.string().min(1),
  preferredName: z.string().optional(),
  email: z.string().email(),
  role: RoleEnum,
  primaryOfficeId: z.string().uuid(),
  primaryDisciplineId: z.string().uuid().optional(),
  hourlyCostRate: z.number().min(0).optional(),
  hourlyBillRate: z.number().min(0).optional(),
  managerId: z.string().uuid().optional(),
});

export const UpdateStaffSchema = CreateStaffSchema.partial().extend({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
});

export type CreateStaffDTO = z.infer<typeof CreateStaffSchema>;
export type UpdateStaffDTO = z.infer<typeof UpdateStaffSchema>;
```
