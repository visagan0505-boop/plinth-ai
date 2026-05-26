import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { CreateJobDTO, UpdateJobDTO } from '@/lib/dtos/job';
import { generateJobNumber } from '@/lib/services/sequence';
import { dispatchDomainEvent } from '@/lib/services/events';

type Db = SupabaseClient<Database>;
type JobRow = Database['public']['Tables']['jobs']['Row'];

export async function listJobs(db: Db, tenantId: string): Promise<JobRow[]> {
  const { data, error } = await db
    .from('jobs')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('job_number', { ascending: false });

  if (error) {
    throw new Error(`Failed to list jobs: ${error.message}`);
  }

  return data;
}

export async function getJobById(db: Db, jobId: string, tenantId: string): Promise<JobRow> {
  const { data, error } = await db
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) {
    throw new Error(`Job not found: ${error?.message}`);
  }

  return data;
}

export async function createJob(
  db: Db,
  dto: CreateJobDTO,
  tenantId: string,
  auditorId: string
): Promise<JobRow> {
  // 1. Generate immutable job number via Sequence Generator
  const jobNumber = await generateJobNumber(db, tenantId);

  const payload: Database['public']['Tables']['jobs']['Insert'] = {
    tenant_id: tenantId,
    job_number: jobNumber,
    name: dto.name,
    client_id: dto.clientId,
    job_type_id: dto.jobTypeId,
    status_id: dto.statusId,
    risk_tier_id: dto.riskTierId,
    project_director_id: dto.projectDirectorId,
    design_manager_id: dto.designManagerId || null,
    primary_office_id: dto.primaryOfficeId,
    site_address: dto.siteAddress || null,
    lot_number: dto.lotNumber || null,
    dp_number: dto.dpNumber || null,
    fee_value: dto.feeValue,
    project_risk_value: dto.projectRiskValue,
    opened_date: dto.openedDate || new Date().toISOString().split('T')[0],
    target_completion_date: dto.targetCompletionDate || null,
    description: dto.description || null,
    created_by: auditorId,
    updated_by: auditorId,
  };

  // 2. Insert Job
  const { data, error } = await db
    .from('jobs')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }

  // 3. Dispatch Event
  await dispatchDomainEvent(db, tenantId, 'job.created', 'job', data.id, auditorId, {
    job_number: jobNumber,
    name: dto.name,
    client_id: dto.clientId
  });

  return data;
}

export async function updateJob(
  db: Db,
  dto: UpdateJobDTO,
  tenantId: string,
  auditorId: string
): Promise<JobRow> {
  const payload: any = {
    updated_by: auditorId,
    updated_at: new Date().toISOString(),
  };

  // We explicitly DO NOT allow updating job_number
  if (dto.name !== undefined) payload.name = dto.name;
  if (dto.clientId !== undefined) payload.client_id = dto.clientId;
  if (dto.jobTypeId !== undefined) payload.job_type_id = dto.jobTypeId;
  if (dto.statusId !== undefined) payload.status_id = dto.statusId;
  if (dto.riskTierId !== undefined) payload.risk_tier_id = dto.riskTierId;
  if (dto.projectDirectorId !== undefined) payload.project_director_id = dto.projectDirectorId;
  if (dto.designManagerId !== undefined) payload.design_manager_id = dto.designManagerId;
  if (dto.primaryOfficeId !== undefined) payload.primary_office_id = dto.primaryOfficeId;
  if (dto.siteAddress !== undefined) payload.site_address = dto.siteAddress;
  if (dto.lotNumber !== undefined) payload.lot_number = dto.lotNumber;
  if (dto.dpNumber !== undefined) payload.dp_number = dto.dpNumber;
  if (dto.feeValue !== undefined) payload.fee_value = dto.feeValue;
  if (dto.projectRiskValue !== undefined) payload.project_risk_value = dto.projectRiskValue;
  if (dto.openedDate !== undefined) payload.opened_date = dto.openedDate;
  if (dto.targetCompletionDate !== undefined) payload.target_completion_date = dto.targetCompletionDate;
  if (dto.description !== undefined) payload.description = dto.description;

  const { data, error } = await db
    .from('jobs')
    .update(payload)
    .eq('id', dto.id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update job: ${error.message}`);
  }

  // Dispatch Event
  await dispatchDomainEvent(db, tenantId, 'job.updated', 'job', data.id, auditorId, {
    updated_fields: Object.keys(payload).filter(k => k !== 'updated_by' && k !== 'updated_at')
  });

  return data;
}

export async function archiveJob(
  db: Db,
  jobId: string,
  closeoutStatusId: string,
  tenantId: string,
  auditorId: string
): Promise<JobRow> {
  const { data, error } = await db
    .from('jobs')
    .update({
      status_id: closeoutStatusId,
      actual_completion_date: new Date().toISOString().split('T')[0],
      updated_by: auditorId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to archive job: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'job.archived', 'job', data.id, auditorId, {
    status_id: closeoutStatusId
  });

  return data;
}
