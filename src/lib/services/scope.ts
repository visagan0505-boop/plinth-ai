import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { CreateScopeDTO, UpdateScopeDTO } from '@/lib/dtos/scope';
import { dispatchDomainEvent } from '@/lib/services/events';

type Db = SupabaseClient<Database>;
type ScopeRow = Database['public']['Tables']['job_scopes']['Row'];

export async function listScopesByPhaseId(db: Db, tenantId: string, phaseId: string): Promise<ScopeRow[]> {
  const { data, error } = await db
    .from('job_scopes')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('phase_id', phaseId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to list scopes: ${error.message}`);
  }

  return data;
}

export async function createScope(
  db: Db,
  dto: CreateScopeDTO,
  tenantId: string,
  auditorId: string
): Promise<ScopeRow> {
  const payload: Database['public']['Tables']['job_scopes']['Insert'] = {
    tenant_id: tenantId,
    phase_id: dto.phaseId,
    name: dto.name,
    description: dto.description || null,
    sort_order: dto.sortOrder,
    is_included: dto.isIncluded,
    created_by: auditorId,
    updated_by: auditorId,
  };

  const { data, error } = await db
    .from('job_scopes')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create scope: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'scope.created', 'job_scopes', data.id, auditorId, { 
    phase_id: dto.phaseId, 
    name: dto.name 
  });

  return data;
}

export async function updateScope(
  db: Db,
  dto: UpdateScopeDTO,
  tenantId: string,
  auditorId: string
): Promise<ScopeRow> {
  const payload: any = {
    updated_by: auditorId,
    updated_at: new Date().toISOString(),
  };

  if (dto.name !== undefined) payload.name = dto.name;
  if (dto.description !== undefined) payload.description = dto.description;
  if (dto.sortOrder !== undefined) payload.sort_order = dto.sortOrder;
  if (dto.isIncluded !== undefined) payload.is_included = dto.isIncluded;

  const { data, error } = await db
    .from('job_scopes')
    .update(payload)
    .eq('id', dto.id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update scope: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'scope.updated', 'job_scopes', data.id, auditorId, { 
    name: dto.name
  });

  return data;
}
