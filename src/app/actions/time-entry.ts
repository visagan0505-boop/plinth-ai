'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import { CreateTimeEntrySchema, CreateTimeEntryDTO, UpdateTimeEntrySchema, UpdateTimeEntryDTO } from '@/lib/dtos/time-entry';
import { createTimeEntry, updateTimeEntry } from '@/lib/services/time-entry';
import { ActionResponse } from '@/app/actions/job';

export async function createTimeEntryAction(formData: CreateTimeEntryDTO): Promise<ActionResponse<any>> {
  try {
    const parsed = CreateTimeEntrySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };
    }

    const context = await getOperationalContext();
    const db = await createClient();

    const data = await createTimeEntry(db, parsed.data, context.tenantId, context.staffId);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to create time entry:', error);
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}

export async function updateTimeEntryAction(formData: UpdateTimeEntryDTO): Promise<ActionResponse<any>> {
  try {
    const parsed = UpdateTimeEntrySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };
    }

    const context = await getOperationalContext();
    const db = await createClient();

    const data = await updateTimeEntry(db, parsed.data, context.tenantId, context.staffId);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to update time entry:', error);
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}
