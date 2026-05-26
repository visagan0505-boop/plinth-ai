'use server';

import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { CreateInvoiceSchema, CreateInvoiceDTO } from '@/lib/dtos/finance';
import { createInvoice, issueInvoice } from '@/lib/services/invoice';
import { calculateJobProfitability } from '@/lib/services/profitability';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export type ActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: 'ValidationFailed'; details: z.ZodError }
  | { success: false; error: 'DatabaseError'; message: string };

export async function createInvoiceAction(
  formData: CreateInvoiceDTO
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const parsed = CreateInvoiceSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: parsed.error };
    }

    const data = await createInvoice(db, parsed.data, context.tenantId, context.userId);
    revalidatePath(`/jobs/${formData.jobId}/invoices`);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}

export async function issueInvoiceAction(
  invoiceId: string,
  jobId: string
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const data = await issueInvoice(db, invoiceId, context.tenantId, context.userId);
    revalidatePath(`/jobs/${jobId}/invoices`);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}

export async function getJobProfitabilityAction(
  jobId: string,
  asOfDate?: string
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const data = await calculateJobProfitability(db, jobId, context.tenantId, asOfDate);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}
