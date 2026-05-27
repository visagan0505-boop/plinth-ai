import { z } from 'zod';

export const CreateScopeSchema = z.object({
  phaseId: z.string().uuid("Invalid Phase ID"),
  name: z.string().min(1, "Scope name is required").max(255, "Scope name is too long"),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isIncluded: z.boolean().default(true),
});

export type CreateScopeDTO = z.infer<typeof CreateScopeSchema>;

export const UpdateScopeSchema = CreateScopeSchema.partial().extend({
  id: z.string().uuid("Invalid Scope ID"),
});

export type UpdateScopeDTO = z.infer<typeof UpdateScopeSchema>;
