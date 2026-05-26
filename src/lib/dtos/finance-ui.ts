import { z } from 'zod';
import { InvoiceStatusEnum } from './finance';

export const InvoiceListParamsSchema = z.object({
  jobId: z.string().uuid(),
  status: InvoiceStatusEnum.optional(),
});

export type InvoiceListParamsDTO = z.infer<typeof InvoiceListParamsSchema>;
