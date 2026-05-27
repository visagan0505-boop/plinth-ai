import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { CreateTimeEntryDTO, UpdateTimeEntryDTO } from '@/lib/dtos/time-entry';
import { dispatchDomainEvent } from '@/lib/services/events';

type Db = SupabaseClient<Database>;
type TimeEntryRow = Database['public']['Tables']['time_entries']['Row'];

export async function listTimeEntries(
  db: Db,
  tenantId: string,
  filters?: { staffId?: string; jobId?: string; startDate?: string; endDate?: string }
): Promise<TimeEntryRow[]> {
  let query = db
    .from('time_entries')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('operational_date', { ascending: false });

  if (filters?.staffId) query = query.eq('staff_id', filters.staffId);
  if (filters?.jobId) query = query.eq('job_id', filters.jobId);
  if (filters?.startDate) query = query.gte('operational_date', filters.startDate);
  if (filters?.endDate) query = query.lte('operational_date', filters.endDate);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list time entries: ${error.message}`);
  }

  return data;
}

export async function createTimeEntry(
  db: Db,
  dto: CreateTimeEntryDTO,
  tenantId: string,
  auditorId: string
): Promise<TimeEntryRow> {
  // 1. Resolve Staff Rates to preserve profitability context
  const { data: staff, error: staffError } = await db
    .from('staff')
    .select('hourly_cost_rate, hourly_bill_rate')
    .eq('id', dto.staffId)
    .eq('tenant_id', tenantId)
    .single();

  if (staffError || !staff) {
    throw new Error('Failed to resolve staff rates for time entry');
  }

  const payload: any = {
    tenant_id: tenantId,
    staff_id: dto.staffId,
    job_id: dto.jobId,
    job_phase_id: dto.phaseId,
    scope_id: dto.scopeId,
    component_id: dto.componentId || null,
    operational_date: dto.entryDate,
    hours: dto.hours,
    notes: dto.notes || null,
    is_billable: dto.isBillable,
    snapshot_cost_rate: staff.hourly_cost_rate || 0,
    snapshot_bill_rate: staff.hourly_bill_rate || 0,
    status: 'SUBMITTED', // Bypass approval workflows per Phase 3E rules
    created_by: auditorId,
    updated_by: auditorId,
  };

  const { data, error } = await db
    .from('time_entries')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create time entry: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'time_entry.created', 'time_entries', data.id, auditorId, {
    staff_id: dto.staffId,
    job_id: dto.jobId,
    hours: dto.hours,
    entry_date: dto.entryDate,
    is_billable: dto.isBillable
  });

  return data;
}

export async function updateTimeEntry(
  db: Db,
  dto: UpdateTimeEntryDTO,
  tenantId: string,
  auditorId: string
): Promise<TimeEntryRow> {
  const payload: any = {
    updated_by: auditorId,
    updated_at: new Date().toISOString(),
  };

  // Allow correction of attribution
  if (dto.jobId !== undefined) payload.job_id = dto.jobId;
  if (dto.phaseId !== undefined) payload.job_phase_id = dto.phaseId;
  if (dto.scopeId !== undefined) payload.scope_id = dto.scopeId;
  if (dto.componentId !== undefined) payload.component_id = dto.componentId;
  
  if (dto.entryDate !== undefined) payload.operational_date = dto.entryDate;
  if (dto.hours !== undefined) payload.hours = dto.hours;
  if (dto.isBillable !== undefined) payload.is_billable = dto.isBillable;
  if (dto.notes !== undefined) payload.notes = dto.notes;

  const { data, error } = await db
    .from('time_entries')
    .update(payload)
    .eq('id', dto.id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update time entry: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'time_entry.updated', 'time_entries', data.id, auditorId, {
    hours: data.hours,
    is_billable: data.is_billable
  });

  return data;
}
