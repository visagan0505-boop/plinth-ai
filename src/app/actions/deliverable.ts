'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getOperationalContext } from '@/lib/auth/session';
import { CreateDeliverableSchema, CreateRevisionSchema, UpdateRevisionSchema, IssueTransmittalSchema } from '@/lib/dtos/deliverable';
import { createDeliverable, createRevision, updateRevision, issueTransmittal } from '@/lib/services/deliverable';

export async function createDeliverableAction(formData: any) {
  try {
    const parsed = CreateDeliverableSchema.safeParse(formData);
    if (!parsed.success) return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };

    const context = await getOperationalContext();
    const db = await createClient();
    const data = await createDeliverable(db, parsed.data, context.tenantId, context.staffId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}

export async function createRevisionAction(formData: any) {
  try {
    const parsed = CreateRevisionSchema.safeParse(formData);
    if (!parsed.success) return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };

    const context = await getOperationalContext();
    const db = await createClient();
    const data = await createRevision(db, parsed.data, context.tenantId, context.staffId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}

export async function updateRevisionAction(formData: any) {
  try {
    const parsed = UpdateRevisionSchema.safeParse(formData);
    if (!parsed.success) return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };

    const context = await getOperationalContext();
    const db = await createClient();
    const data = await updateRevision(db, parsed.data, context.tenantId, context.staffId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}

export async function issueTransmittalAction(formData: any) {
  try {
    const parsed = IssueTransmittalSchema.safeParse(formData);
    if (!parsed.success) return { success: false, error: 'ValidationFailed', details: { issues: parsed.error.issues } };

    const context = await getOperationalContext();
    const db = await createClient();
    const data = await issueTransmittal(db, parsed.data, context.tenantId, context.staffId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: 'DatabaseError', message: error.message };
  }
}
