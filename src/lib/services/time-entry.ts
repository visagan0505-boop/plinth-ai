import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { CreateTimeEntryDTO, UpdateTimeEntryDTO } from '@/lib/dtos/time-entry';
import { canMutateEntry, TIME_ENTRY_LIFECYCLE } from '@/lib/services/time-entry-lifecycle';
import { dispatchDomainEvent } from '@/lib/services/events';
import { getStaffById } from '@/lib/services/staff';

type Db = SupabaseClient<Database>;
// Using any as the schema isn't yet compiled with the new time_entries table
type TimeEntryRow = any;

export async function listTimeEntries(db: Db, tenantId: string, staffId: string): Promise<TimeEntryRow[]> {
  const { data, error } = await db
    .from('time_entries')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('staff_id', staffId)
    .order('operational_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to list time entries: ${error.message}`);
  }

  return data;
}

export async function getTimeEntryById(db: Db, entryId: string, tenantId: string): Promise<TimeEntryRow> {
  const { data, error } = await db
    .from('time_entries')
    .select('*')
    .eq('id', entryId)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) {
    throw new Error(`Time entry not found: ${error?.message}`);
  }

  return data;
}

export async function createTimeEntry(
  db: Db,
  dto: CreateTimeEntryDTO,
  tenantId: string,
  auditorId: string
): Promise<TimeEntryRow> {
  // 1. Fetch current staff rates for snapshotting
  const staffRecord = await getStaffById(db, auditorId, tenantId);
  const costRate = staffRecord.hourly_cost_rate || 0;
  const billRate = staffRecord.hourly_bill_rate || 0;

  const payload = {
    tenant_id: tenantId,
    staff_id: auditorId,
    job_id: dto.jobId,
    job_phase_id: dto.jobPhaseId || null,
    operational_date: dto.operationalDate,
    hours: dto.hours,
    notes: dto.notes || null,
    snapshot_cost_rate: costRate,
    snapshot_bill_rate: billRate,
    is_billable: dto.isBillable,
    status: TIME_ENTRY_LIFECYCLE.DRAFT,
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

  await dispatchDomainEvent(db, tenantId, 'time_entry.created', 'time_entry', data.id, auditorId, {
    job_id: dto.jobId,
    hours: dto.hours,
    operational_date: dto.operationalDate
  });

  return data;
}

export async function updateTimeEntry(
  db: Db,
  dto: UpdateTimeEntryDTO,
  tenantId: string,
  auditorId: string
): Promise<TimeEntryRow> {
  // 1. Fetch existing entry to check lifecycle rules
  const existing = await getTimeEntryById(db, dto.id!, tenantId);

  // 2. Validate state transitions
  if (!canMutateEntry(existing.status)) {
    throw new Error(`Cannot mutate a time entry in ${existing.status} state.`);
  }

  const payload: any = {
    updated_by: auditorId,
    updated_at: new Date().toISOString(),
  };

  if (dto.jobId !== undefined) payload.job_id = dto.jobId;
  if (dto.jobPhaseId !== undefined) payload.job_phase_id = dto.jobPhaseId;
  if (dto.operationalDate !== undefined) payload.operational_date = dto.operationalDate;
  if (dto.hours !== undefined) payload.hours = dto.hours;
  if (dto.notes !== undefined) payload.notes = dto.notes;
  if (dto.isBillable !== undefined) payload.is_billable = dto.isBillable;

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

  await dispatchDomainEvent(db, tenantId, 'time_entry.updated', 'time_entry', data.id, auditorId, {
    updated_fields: Object.keys(payload).filter(k => k !== 'updated_by' && k !== 'updated_at')
  });

  return data;
}

export async function submitTimeEntries(
  db: Db,
  entryIds: string[],
  tenantId: string,
  auditorId: string
): Promise<void> {
  // We do not check state individually in the app layer for batch updates to avoid N+1,
  // we let Postgres enforce it via the WHERE clause:
  
  const { error } = await db
    .from('time_entries')
    .update({
      status: TIME_ENTRY_LIFECYCLE.SUBMITTED,
      updated_by: auditorId,
      updated_at: new Date().toISOString(),
    })
    .in('id', entryIds)
    .eq('tenant_id', tenantId)
    .eq('status', TIME_ENTRY_LIFECYCLE.DRAFT); // Only update drafts

  if (error) {
    throw new Error(`Failed to submit time entries: ${error.message}`);
  }

  // A domain event for batch submissions could be fired here
  await dispatchDomainEvent(db, tenantId, 'time_entry.batch_submitted', 'time_entry_batch', auditorId, auditorId, {
    count: entryIds.length,
    ids: entryIds
  });
}

export async function approveTimeEntries(
  db: Db,
  entryIds: string[],
  tenantId: string,
  approverId: string
): Promise<void> {
  const { error } = await db
    .from('time_entries')
    .update({
      status: TIME_ENTRY_LIFECYCLE.APPROVED,
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      updated_by: approverId,
      updated_at: new Date().toISOString(),
    })
    .in('id', entryIds)
    .eq('tenant_id', tenantId)
    .eq('status', TIME_ENTRY_LIFECYCLE.SUBMITTED); // Only approve submitted entries

  if (error) {
    throw new Error(`Failed to approve time entries: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'time_entry.batch_approved', 'time_entry_batch', approverId, approverId, {
    count: entryIds.length,
    ids: entryIds
  });
}
