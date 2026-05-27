import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { CreateComponentDTO, UpdateComponentDTO } from '@/lib/dtos/component';
import { dispatchDomainEvent } from '@/lib/services/events';

type Db = SupabaseClient<Database>;
type ComponentRow = Database['public']['Tables']['job_components']['Row'];

export async function listComponentsByScopeId(db: Db, tenantId: string, scopeId: string): Promise<ComponentRow[]> {
  const { data, error } = await db
    .from('job_components')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('scope_id', scopeId)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to list components: ${error.message}`);
  }

  return data;
}

export async function createComponent(
  db: Db,
  dto: CreateComponentDTO,
  tenantId: string,
  auditorId: string
): Promise<ComponentRow> {
  const payload: Database['public']['Tables']['job_components']['Insert'] = {
    tenant_id: tenantId,
    scope_id: dto.scopeId,
    name: dto.name,
    description: dto.description || null,
    estimated_hours: dto.estimatedHours,
    sort_order: dto.sortOrder,
    is_billable: dto.isBillable,
    created_by: auditorId,
    updated_by: auditorId,
  };

  const { data, error } = await db
    .from('job_components')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create component: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'component.created', 'job_components', data.id, auditorId, { 
    scope_id: dto.scopeId, 
    name: dto.name 
  });

  return data;
}

export async function updateComponent(
  db: Db,
  dto: UpdateComponentDTO,
  tenantId: string,
  auditorId: string
): Promise<ComponentRow> {
  const payload: any = {
    updated_by: auditorId,
    updated_at: new Date().toISOString(),
  };

  if (dto.name !== undefined) payload.name = dto.name;
  if (dto.description !== undefined) payload.description = dto.description;
  if (dto.estimatedHours !== undefined) payload.estimated_hours = dto.estimatedHours;
  if (dto.sortOrder !== undefined) payload.sort_order = dto.sortOrder;
  if (dto.isBillable !== undefined) payload.is_billable = dto.isBillable;

  const { data, error } = await db
    .from('job_components')
    .update(payload)
    .eq('id', dto.id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update component: ${error.message}`);
  }

  await dispatchDomainEvent(db, tenantId, 'component.updated', 'job_components', data.id, auditorId, { 
    name: dto.name
  });

  return data;
}
