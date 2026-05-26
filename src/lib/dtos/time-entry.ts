import { z } from 'zod';

export const TimeEntryStatusEnum = z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED']);
export type TimeEntryStatus = z.infer<typeof TimeEntryStatusEnum>;

export const CreateTimeEntrySchema = z.object({
  jobId: z.string().uuid("Job is required"),
  jobPhaseId: z.string().uuid().optional().nullable(),
  operationalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  hours: z.number().refine(val => val !== 0, "Hours cannot be exactly zero"),
  notes: z.string().optional().nullable(),
  isBillable: z.boolean().default(true),
});

export const UpdateTimeEntrySchema = CreateTimeEntrySchema.partial().extend({
  id: z.string().uuid("Invalid time entry ID"),
  // Only allowed while in DRAFT state
});

export const SubmitTimeEntriesSchema = z.object({
  timeEntryIds: z.array(z.string().uuid()).min(1),
});

export const ApproveTimeEntriesSchema = z.object({
  timeEntryIds: z.array(z.string().uuid()).min(1),
});

export type CreateTimeEntryDTO = z.infer<typeof CreateTimeEntrySchema>;
export type UpdateTimeEntryDTO = z.infer<typeof UpdateTimeEntrySchema>;
