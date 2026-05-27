'use server';

import { 
  CreateJobSchema, 
  UpdateJobSchema, 
  CreateJobDTO, 
  UpdateJobDTO 
} from '@/lib/dtos/job';
import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { 
  createJob, 
  updateJob, 
  archiveJob 
} from '@/lib/services/job';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export type ActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: 'ValidationFailed'; details: { issues: z.ZodIssue[] } }
  | { success: false; error: 'DatabaseError'; message: string };

export async function createJobAction(
  formData: CreateJobDTO
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const parsed = CreateJobSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };
    }

    const data = await createJob(db, parsed.data, context.tenantId, context.userId);
    revalidatePath('/jobs');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}

export async function updateJobAction(
  formData: UpdateJobDTO
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const parsed = UpdateJobSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };
    }

    const data = await updateJob(db, parsed.data, context.tenantId, context.userId);
    revalidatePath('/jobs');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}

export async function archiveJobAction(
  jobId: string,
  closeoutStatusId: string
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const data = await archiveJob(db, jobId, closeoutStatusId, context.tenantId, context.userId);
    revalidatePath('/jobs');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}
