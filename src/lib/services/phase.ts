import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { CreatePhaseDTO, UpdatePhaseDTO } from '@/lib/dtos/phase';
import { dispatchDomainEvent } from '@/lib/services/events';

type Db = SupabaseClient<Database>;
type PhaseRow = Database['public']['Tables']['job_phases']['Row'];

export async function listPhasesByJobId(db: Db, tenantId: string, jobId: string): Promise<PhaseRow[]> {
  const { data, error } = await db
    .from('job_phases')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('job_id', jobId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to list phases: ${error.message}`);
  }

  return data;
}

export async function createPhase(
  db: Db,
  dto: CreatePhaseDTO,
  tenantId: string,
  auditorId: string
): Promise<PhaseRow> {
  const payload: Database['public']['Tables']['job_phases']['Insert'] = {
    tenant_id: tenantId,
    job_id: dto.jobId,
    name: dto.name,
    sort_order: dto.sortOrder,
    estimated_hours: dto.estimatedHours,
    fee_amount: dto.feeAmount,
    status: dto.status,
    planned_start_date: dto.plannedStartDate || null,
    planned_end_date: dto.plannedEndDate || null,
    created_by: auditorId,
    updated_by: auditorId,
  };

  const { data, error } = await db
    .from('job_phases')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create phase: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'phase.created', 'job_phases', data.id, auditorId, { 
    job_id: dto.jobId, 
    name: dto.name 
  });

  return data;
}

export async function updatePhase(
  db: Db,
  dto: UpdatePhaseDTO,
  tenantId: string,
  auditorId: string
): Promise<PhaseRow> {
  const payload: any = {
    updated_by: auditorId,
    updated_at: new Date().toISOString(),
  };

  if (dto.name !== undefined) payload.name = dto.name;
  if (dto.sortOrder !== undefined) payload.sort_order = dto.sortOrder;
  if (dto.estimatedHours !== undefined) payload.estimated_hours = dto.estimatedHours;
  if (dto.feeAmount !== undefined) payload.fee_amount = dto.feeAmount;
  if (dto.status !== undefined) payload.status = dto.status;
  if (dto.plannedStartDate !== undefined) payload.planned_start_date = dto.plannedStartDate;
  if (dto.plannedEndDate !== undefined) payload.planned_end_date = dto.plannedEndDate;

  const { data, error } = await db
    .from('job_phases')
    .update(payload)
    .eq('id', dto.id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update phase: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'phase.updated', 'job_phases', data.id, auditorId, { 
    name: dto.name,
    status: dto.status
  });

  return data;
}
