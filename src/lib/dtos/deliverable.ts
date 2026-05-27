import { z } from 'zod';

// Deliverable Schemas
export const CreateDeliverableSchema = z.object({
  jobId: z.string().uuid("Invalid Job ID"),
  phaseId: z.string().uuid("Invalid Phase ID").nullable().optional(),
  scopeId: z.string().uuid("Invalid Scope ID").nullable().optional(),
  
  deliverableCode: z.string().min(1, "Deliverable code is required"),
  name: z.string().min(1, "Name is required"),
  type: z.enum(['Drawing', 'Calculation', 'Specification', 'Report', 'Other']),
  metadata: z.record(z.any()).optional().nullable(),
});
export type CreateDeliverableDTO = z.infer<typeof CreateDeliverableSchema>;

// Revision Schemas
export const CreateRevisionSchema = z.object({
  deliverableId: z.string().uuid("Invalid Deliverable ID"),
  revisionNumber: z.string().min(1, "Revision number is required"),
  internalNotes: z.string().optional().nullable(),
  fileUrl: z.string().url("Invalid file URL").optional().nullable(),
});
export type CreateRevisionDTO = z.infer<typeof CreateRevisionSchema>;

export const UpdateRevisionSchema = z.object({
  id: z.string().uuid("Invalid Revision ID"),
  revisionNumber: z.string().min(1, "Revision number is required").optional(),
  internalNotes: z.string().optional().nullable(),
  fileUrl: z.string().url("Invalid file URL").optional().nullable(),
});
export type UpdateRevisionDTO = z.infer<typeof UpdateRevisionSchema>;

// Transmittal Schemas
export const IssueTransmittalSchema = z.object({
  jobId: z.string().uuid("Invalid Job ID"),
  issueReason: z.string().min(1, "Issue reason is required"),
  message: z.string().optional().nullable(),
  revisionIds: z.array(z.string().uuid("Invalid Revision ID")).min(1, "At least one revision must be included in a transmittal"),
});
export type IssueTransmittalDTO = z.infer<typeof IssueTransmittalSchema>;
