import { z } from 'zod';

export const CreatePhaseSchema = z.object({
  jobId: z.string().uuid("Invalid Job ID"),
  name: z.string().min(1, "Phase name is required").max(255, "Phase name is too long"),
  sortOrder: z.number().int().min(0).default(0),
  estimatedHours: z.number().min(0, "Estimated hours cannot be negative").default(0),
  feeAmount: z.number().min(0, "Fee amount cannot be negative").default(0),
  status: z.enum(['not_started', 'in_progress', 'completed', 'on_hold']).default('not_started'),
  plannedStartDate: z.string().nullable().optional(),
  plannedEndDate: z.string().nullable().optional(),
});

export type CreatePhaseDTO = z.infer<typeof CreatePhaseSchema>;

export const UpdatePhaseSchema = CreatePhaseSchema.partial().extend({
  id: z.string().uuid("Invalid Phase ID"),
});

export type UpdatePhaseDTO = z.infer<typeof UpdatePhaseSchema>;
