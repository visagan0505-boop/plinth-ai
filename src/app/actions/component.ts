'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import { CreateComponentSchema, CreateComponentDTO, UpdateComponentSchema, UpdateComponentDTO } from '@/lib/dtos/component';
import { createComponent, updateComponent } from '@/lib/services/component';
import { ActionResponse } from '@/app/actions/job';

export async function createComponentAction(formData: CreateComponentDTO): Promise<ActionResponse<any>> {
  try {
    const parsed = CreateComponentSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };
    }

    const context = await getOperationalContext();
    const db = await createClient();

    const data = await createComponent(db, parsed.data, context.tenantId, context.userId);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to create component:', error);
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}

export async function updateComponentAction(formData: UpdateComponentDTO): Promise<ActionResponse<any>> {
  try {
    const parsed = UpdateComponentSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };
    }

    const context = await getOperationalContext();
    const db = await createClient();

    const data = await updateComponent(db, parsed.data, context.tenantId, context.userId);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to update component:', error);
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}
