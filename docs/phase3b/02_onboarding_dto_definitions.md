# Onboarding DTO Definitions

## Principle
Data Transfer Objects (DTOs) bridge the gap between incoming client form data and typed database inserts.

## DTO Schema definition (Zod)

```typescript
import { z } from 'zod';

export const TenantOnboardingSchema = z.object({
  tenantName: z.string().min(3).max(100),
  tenantSlug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  
  // Initial Office
  officeName: z.string().min(3).max(100),
  
  // Initial Discipline
  disciplineName: z.string().min(3).max(100),
  
  // Operational Staff Info (for the bootstrapping user)
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  jobTitle: z.string().min(1),
  costRate: z.number().min(0),
  billRate: z.number().min(0),
});

export type TenantOnboardingDTO = z.infer<typeof TenantOnboardingSchema>;
```

## Database Types alignment
The resulting DTOs must logically map to inserts for:
- `Tables<'tenants'>`
- `Tables<'office_locations'>`
- `Tables<'disciplines'>`
- `Tables<'staff'>`
- `Tables<'staff_rate_periods'>`
