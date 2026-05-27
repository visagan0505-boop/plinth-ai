import { z } from 'zod';

export const CreateComponentSchema = z.object({
  scopeId: z.string().uuid("Invalid Scope ID"),
  name: z.string().min(1, "Component name is required").max(255, "Component name is too long"),
  description: z.string().nullable().optional(),
  estimatedHours: z.number().min(0, "Estimated hours cannot be negative").default(0),
  sortOrder: z.number().int().min(0).default(0),
  isBillable: z.boolean().default(true),
});

export type CreateComponentDTO = z.infer<typeof CreateComponentSchema>;

export const UpdateComponentSchema = CreateComponentSchema.partial().extend({
  id: z.string().uuid("Invalid Component ID"),
});

export type UpdateComponentDTO = z.infer<typeof UpdateComponentSchema>;
