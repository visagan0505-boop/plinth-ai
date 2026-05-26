import { z } from 'zod';

export const InvoiceStatusEnum = z.enum(['DRAFT', 'ISSUED', 'PAID', 'CANCELLED']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

export const CreateInvoiceLineItemSchema = z.object({
  jobPhaseId: z.string().uuid().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0).default(1),
  unitPrice: z.number().min(0).default(0),
});

export const CreateInvoiceSchema = z.object({
  jobId: z.string().uuid("Job ID is required"),
  notes: z.string().optional().nullable(),
  lineItems: z.array(CreateInvoiceLineItemSchema).min(1, "At least one line item is required"),
});

export type CreateInvoiceDTO = z.infer<typeof CreateInvoiceSchema>;

export const UpdateInvoiceSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().optional().nullable(),
  lineItems: z.array(CreateInvoiceLineItemSchema).min(1, "At least one line item is required"),
});

export type UpdateInvoiceDTO = z.infer<typeof UpdateInvoiceSchema>;
