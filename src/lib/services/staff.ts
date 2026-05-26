import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { CreateStaffDTO, UpdateStaffDTO } from '@/lib/dtos/staff';

type Db = SupabaseClient<Database>;
type StaffRow = Database['public']['Tables']['staff']['Row'];

export async function listStaff(db: Db, tenantId: string): Promise<StaffRow[]> {
  const { data, error } = await db
    .from('staff')
    .select('*')
    // RLS filters this anyway, but explicit tenant boundary is good practice
    .eq('tenant_id', tenantId) 
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to list staff: ${error.message}`);
  }

  return data;
}

export async function getStaffById(db: Db, staffId: string, tenantId: string): Promise<StaffRow> {
  const { data, error } = await db
    .from('staff')
    .select('*')
    .eq('id', staffId)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) {
    throw new Error(`Staff not found: ${error?.message}`);
  }

  return data;
}

export async function createStaff(
  db: Db,
  dto: CreateStaffDTO,
  tenantId: string,
  auditorId: string
): Promise<StaffRow> {
  const payload = {
    tenant_id: tenantId,
    full_name: dto.fullName,
    preferred_name: dto.preferredName || null,
    email: dto.email,
    role: dto.role,
    primary_office_id: dto.primaryOfficeId,
    primary_discipline_id: dto.primaryDisciplineId || null,
    hourly_cost_rate: dto.hourlyCostRate || null,
    hourly_bill_rate: dto.hourlyBillRate || null,
    manager_id: dto.managerId || null,
    is_active: dto.isActive,
    created_by: auditorId,
    updated_by: auditorId,
  };

  const { data, error } = await db
    .from('staff')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create staff: ${error.message}`);
  }

  return data;
}

export async function updateStaff(
  db: Db,
  dto: UpdateStaffDTO,
  tenantId: string,
  auditorId: string
): Promise<StaffRow> {
  const payload: any = {
    updated_by: auditorId,
    updated_at: new Date().toISOString(),
  };

  if (dto.fullName !== undefined) payload.full_name = dto.fullName;
  if (dto.preferredName !== undefined) payload.preferred_name = dto.preferredName;
  if (dto.email !== undefined) payload.email = dto.email;
  if (dto.role !== undefined) payload.role = dto.role;
  if (dto.primaryOfficeId !== undefined) payload.primary_office_id = dto.primaryOfficeId;
  if (dto.primaryDisciplineId !== undefined) payload.primary_discipline_id = dto.primaryDisciplineId;
  if (dto.hourlyCostRate !== undefined) payload.hourly_cost_rate = dto.hourlyCostRate;
  if (dto.hourlyBillRate !== undefined) payload.hourly_bill_rate = dto.hourlyBillRate;
  if (dto.managerId !== undefined) payload.manager_id = dto.managerId;
  if (dto.isActive !== undefined) payload.is_active = dto.isActive;

  const { data, error } = await db
    .from('staff')
    .update(payload)
    .eq('id', dto.id)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update staff: ${error.message}`);
  }

  return data;
}

export async function deactivateStaff(
  db: Db,
  staffId: string,
  tenantId: string,
  auditorId: string
): Promise<StaffRow> {
  const { data, error } = await db
    .from('staff')
    .update({
      is_active: false,
      updated_by: auditorId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', staffId)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to deactivate staff: ${error.message}`);
  }

  return data;
}
