'use server';

import { 
  CreateStaffSchema, 
  UpdateStaffSchema, 
  CreateStaffDTO, 
  UpdateStaffDTO 
} from '@/lib/dtos/staff';
import { getOperationalContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { 
  createStaff, 
  updateStaff, 
  deactivateStaff 
} from '@/lib/services/staff';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export type ActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: 'ValidationFailed'; details: z.ZodError }
  | { success: false; error: 'DatabaseError'; message: string };

export async function createStaffAction(
  formData: CreateStaffDTO
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const parsed = CreateStaffSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: parsed.error };
    }

    const data = await createStaff(db, parsed.data, context.tenantId, context.userId);
    revalidatePath('/staff');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}

export async function updateStaffAction(
  formData: UpdateStaffDTO
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const parsed = UpdateStaffSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: parsed.error };
    }

    const data = await updateStaff(db, parsed.data, context.tenantId, context.userId);
    revalidatePath('/staff');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}

export async function deactivateStaffAction(
  staffId: string
): Promise<ActionResponse<any>> {
  try {
    const context = await getOperationalContext();
    const db = await createClient();

    const data = await deactivateStaff(db, staffId, context.tenantId, context.userId);
    revalidatePath('/staff');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message };
  }
}
