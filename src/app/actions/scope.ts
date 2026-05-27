'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import { CreateScopeSchema, CreateScopeDTO, UpdateScopeSchema, UpdateScopeDTO } from '@/lib/dtos/scope';
import { createScope, updateScope } from '@/lib/services/scope';
import { ActionResponse } from '@/app/actions/job';

export async function createScopeAction(formData: CreateScopeDTO): Promise<ActionResponse<any>> {
  try {
    const parsed = CreateScopeSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };
    }

    const context = await getOperationalContext();
    const db = await createClient();

    const data = await createScope(db, parsed.data, context.tenantId, context.userId);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to create scope:', error);
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}

export async function updateScopeAction(formData: UpdateScopeDTO): Promise<ActionResponse<any>> {
  try {
    const parsed = UpdateScopeSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };
    }

    const context = await getOperationalContext();
    const db = await createClient();

    const data = await updateScope(db, parsed.data, context.tenantId, context.userId);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to update scope:', error);
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}
