import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { CreateDeliverableDTO, CreateRevisionDTO, UpdateRevisionDTO, IssueTransmittalDTO } from '@/lib/dtos/deliverable';
import { dispatchDomainEvent } from '@/lib/services/events';

type Db = SupabaseClient<Database>;

// ----------------------------------------------------------------------------
// DELIVERABLES
// ----------------------------------------------------------------------------

export async function listDeliverables(db: Db, tenantId: string, jobId: string) {
  const { data, error } = await (db as any)
    .from('deliverables')
    .select(`
      *,
      revisions (*)
    `)
    .eq('tenant_id', tenantId)
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to list deliverables: ${error.message}`);
  return data;
}

export async function createDeliverable(db: Db, dto: CreateDeliverableDTO, tenantId: string, auditorId: string) {
  const payload = {
    tenant_id: tenantId,
    job_id: dto.jobId,
    job_phase_id: dto.phaseId || null,
    scope_id: dto.scopeId || null,
    deliverable_code: dto.deliverableCode,
    name: dto.name,
    type: dto.type,
    metadata: dto.metadata || null,
    created_by: auditorId,
    updated_by: auditorId,
  };

  const { data, error } = await (db as any).from('deliverables').insert(payload).select().single();
  if (error) throw new Error(`Failed to create deliverable: ${error.message}`);

  await dispatchDomainEvent(db, tenantId, 'deliverable.created', 'deliverables', data.id, auditorId, { deliverable_code: data.deliverable_code });
  return data;
}

// ----------------------------------------------------------------------------
// REVISIONS
// ----------------------------------------------------------------------------

export async function createRevision(db: Db, dto: CreateRevisionDTO, tenantId: string, auditorId: string) {
  const payload = {
    tenant_id: tenantId,
    deliverable_id: dto.deliverableId,
    revision_number: dto.revisionNumber,
    status: 'DRAFT',
    internal_notes: dto.internalNotes || null,
    file_url: dto.fileUrl || null,
    created_by: auditorId,
    updated_by: auditorId,
  };

  const { data, error } = await (db as any).from('revisions').insert(payload).select().single();
  if (error) throw new Error(`Failed to create revision: ${error.message}`);

  await dispatchDomainEvent(db, tenantId, 'revision.created', 'revisions', data.id, auditorId, { revision_number: data.revision_number });
  return data;
}

export async function updateRevision(db: Db, dto: UpdateRevisionDTO, tenantId: string, auditorId: string) {
  const payload: any = {
    updated_by: auditorId,
    updated_at: new Date().toISOString(),
  };
  if (dto.revisionNumber !== undefined) payload.revision_number = dto.revisionNumber;
  if (dto.internalNotes !== undefined) payload.internal_notes = dto.internalNotes;
  if (dto.fileUrl !== undefined) payload.file_url = dto.fileUrl;

  const { data, error } = await (db as any)
    .from('revisions')
    .update(payload)
    .eq('id', dto.id)
    .eq('tenant_id', tenantId)
    .eq('status', 'DRAFT') // Ensure immutability guarantee is respected at query level
    .select()
    .single();

  if (error) throw new Error(`Failed to update revision (may be issued already): ${error.message}`);
  
  if (dto.fileUrl) {
    await dispatchDomainEvent(db, tenantId, 'revision.file_attached', 'revisions', data.id, auditorId, { revision_number: data.revision_number });
  }

  return data;
}

// ----------------------------------------------------------------------------
// TRANSMITTALS & ISSUE HISTORY
// ----------------------------------------------------------------------------

export async function issueTransmittal(db: Db, dto: IssueTransmittalDTO, tenantId: string, auditorId: string) {
  // Transmittals must be atomic.
  // 1. Validate all revisions belong to the job and are DRAFT
  const { data: revs, error: revError } = await (db as any)
    .from('revisions')
    .select('id, status, deliverables(job_id)')
    .in('id', dto.revisionIds)
    .eq('tenant_id', tenantId);
    
  if (revError || !revs || revs.length !== dto.revisionIds.length) {
    throw new Error('Invalid revisions provided.');
  }
  
  for (const r of revs) {
    if (r.status === 'ISSUED') throw new Error(`Revision ${r.id} is already issued.`);
    if ((r.deliverables as any).job_id !== dto.jobId) throw new Error(`Revision ${r.id} does not belong to the job.`);
  }

  // 2. Insert Transmittal
  const transmittalPayload = {
    tenant_id: tenantId,
    job_id: dto.jobId,
    issue_reason: dto.issueReason,
    message: dto.message || null,
    created_by: auditorId,
  };
  
  const { data: transmittal, error: tError } = await (db as any).from('transmittals').insert(transmittalPayload).select().single();
  if (tError) throw new Error(`Failed to create transmittal: ${tError.message}`);

  // 3. Insert Items
  const items = dto.revisionIds.map(rid => ({ transmittal_id: transmittal.id, revision_id: rid }));
  const { error: iError } = await (db as any).from('transmittal_items').insert(items);
  if (iError) throw new Error(`Failed to create transmittal items: ${iError.message}`);

  // 4. Lock Revisions (status = ISSUED)
  const { error: uError } = await (db as any).from('revisions')
    .update({ status: 'ISSUED', updated_by: auditorId, updated_at: new Date().toISOString() })
    .in('id', dto.revisionIds)
    .eq('tenant_id', tenantId);
    
  if (uError) throw new Error(`Failed to lock revisions: ${uError.message}`);

  // 5. Dispatch Event
  await dispatchDomainEvent(db, tenantId, 'transmittal.issued', 'transmittals', transmittal.id, auditorId, { 
    issue_reason: transmittal.issue_reason,
    revision_count: items.length
  });

  return transmittal;
}

export async function getIssueHistory(db: Db, tenantId: string, jobId: string) {
  // Derive the history by fetching transmittals -> items -> revisions -> deliverables
  const { data, error } = await (db as any)
    .from('transmittals')
    .select(`
      id, issue_date, issue_reason, message, transmittal_number,
      transmittal_items (
        revisions (
          id, revision_number, file_url,
          deliverables ( id, deliverable_code, name )
        )
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('job_id', jobId)
    .order('issue_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch issue history: ${error.message}`);
  return data;
}
