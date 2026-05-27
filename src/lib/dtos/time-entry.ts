import { z } from 'zod';

export const CreateTimeEntrySchema = z.object({
  staffId: z.string().uuid("Invalid Staff ID"),
  jobId: z.string().uuid("Invalid Job ID"),
  phaseId: z.string().uuid("Invalid Phase ID"),
  scopeId: z.string().uuid("Invalid Scope ID"),
  componentId: z.string().uuid("Invalid Component ID").nullable().optional(),
  
  entryDate: z.string().date("Must be a valid YYYY-MM-DD date"),
  hours: z.number().positive("Hours must be greater than 0").max(24, "Hours cannot exceed 24"),
  
  isBillable: z.boolean().default(true),
  notes: z.string().max(1000, "Notes are too long").nullable().optional(),
});

export type CreateTimeEntryDTO = z.infer<typeof CreateTimeEntrySchema>;

export const UpdateTimeEntrySchema = CreateTimeEntrySchema.partial().extend({
  id: z.string().uuid("Invalid Time Entry ID"),
});

export type UpdateTimeEntryDTO = z.infer<typeof UpdateTimeEntrySchema>;
