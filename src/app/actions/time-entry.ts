'use server';

import { 
  CreateTimeEntrySchema, 
  UpdateTimeEntrySchema, 
  SubmitTimeEntriesSchema,
  ApproveTimeEntriesSchema,
  CreateTimeEntryDTO, 
  UpdateTimeEntryDTO 
} from '@/lib/dtos/time-entry';
import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { 
  createTimeEntry, 
  updateTimeEntry,
  submitTimeEntries,
  approveTimeEntries
} from '@/lib/services/time-entry';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export type ActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: 'ValidationFailed'; details: z.ZodError }
  | { success: false; error: 'DatabaseError'; message: string };

export async function createTimeEntryAction(
  formData: CreateTimeEntryDTO
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const parsed = CreateTimeEntrySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: parsed.error };
    }

    const data = await createTimeEntry(db, parsed.data, context.tenantId, context.userId);
    revalidatePath('/timesheets');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}

export async function updateTimeEntryAction(
  formData: UpdateTimeEntryDTO
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const parsed = UpdateTimeEntrySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: parsed.error };
    }

    const data = await updateTimeEntry(db, parsed.data, context.tenantId, context.userId);
    revalidatePath('/timesheets');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}

export async function submitTimeEntriesAction(
  entryIds: string[]
): Promise<ActionResponse<boolean>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const parsed = SubmitTimeEntriesSchema.safeParse({ timeEntryIds: entryIds });
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: parsed.error };
    }

    await submitTimeEntries(db, entryIds, context.tenantId, context.userId);
    revalidatePath('/timesheets');
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}

export async function approveTimeEntriesAction(
  entryIds: string[]
): Promise<ActionResponse<boolean>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const parsed = ApproveTimeEntriesSchema.safeParse({ timeEntryIds: entryIds });
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: parsed.error };
    }

    // In a real app, we might verify context.userId has permission to approve
    await approveTimeEntries(db, entryIds, context.tenantId, context.userId);
    revalidatePath('/timesheets/approvals');
    return { success: true, data: true };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}
