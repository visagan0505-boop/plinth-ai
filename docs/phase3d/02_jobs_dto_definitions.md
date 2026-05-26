# Jobs DTO Definitions

```typescript
import { z } from 'zod';

export const JobAddressSchema = z.object({
  street: z.string(),
  suburb: z.string().optional(),
  city: z.string(),
  region: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().default('NZ'),
});

export const CreateJobSchema = z.object({
  name: z.string().min(1, "Job name is required"),
  clientId: z.string().uuid(),
  jobTypeId: z.string().uuid(),
  statusId: z.string().uuid(),
  riskTierId: z.string().uuid(),
  projectDirectorId: z.string().uuid(),
  designManagerId: z.string().uuid().optional().nullable(),
  primaryOfficeId: z.string().uuid(),
  siteAddress: JobAddressSchema.optional().nullable(),
  lotNumber: z.string().optional().nullable(),
  dpNumber: z.string().optional().nullable(),
  feeValue: z.number().min(0).default(0),
  projectRiskValue: z.number().min(0).default(0),
  openedDate: z.string().optional(),
  targetCompletionDate: z.string().optional().nullable(),
  description: z.string().optional().nullable()
});

export const UpdateJobSchema = CreateJobSchema.partial().extend({
  id: z.string().uuid(),
});
```
