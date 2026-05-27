'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import { CreatePhaseSchema, CreatePhaseDTO, UpdatePhaseSchema, UpdatePhaseDTO } from '@/lib/dtos/phase';
import { createPhase, updatePhase } from '@/lib/services/phase';
import { ActionResponse } from '@/app/actions/job';

export async function createPhaseAction(formData: CreatePhaseDTO): Promise<ActionResponse<any>> {
  try {
    const parsed = CreatePhaseSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };
    }

    const context = await getOperationalContext();
    const db = await createClient();

    const data = await createPhase(db, parsed.data, context.tenantId, context.staffId);
    
    revalidatePath(`/jobs/${data.job_id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to create phase:', error);
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}

export async function updatePhaseAction(formData: UpdatePhaseDTO): Promise<ActionResponse<any>> {
  try {
    const parsed = UpdatePhaseSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };
    }

    const context = await getOperationalContext();
    const db = await createClient();

    const data = await updatePhase(db, parsed.data, context.tenantId, context.staffId);
    
    revalidatePath(`/jobs/${data.job_id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to update phase:', error);
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}
