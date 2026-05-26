import { createAdminClient } from '@/lib/supabase/admin';
import { TenantOnboardingDTO } from '@/lib/dtos/onboarding';

export async function executeTenantBootstrap(
  userId: string,
  email: string,
  dto: TenantOnboardingDTO
): Promise<string> {
  const adminDb = createAdminClient();

  // Execute the RPC securely using the admin client
  // as the user does not have a tenant_id yet to pass RLS.
  const { data: tenantId, error } = await adminDb.rpc('bootstrap_tenant', {
    p_tenant_name: dto.tenantName,
    p_tenant_slug: dto.tenantSlug,
    p_office_name: dto.officeName,
    p_discipline_name: dto.disciplineName,
    p_user_id: userId,
    p_email: email,
    p_full_name: dto.fullName,
    p_role: dto.role,
    p_hourly_cost_rate: dto.hourlyCostRate,
    p_hourly_bill_rate: dto.hourlyBillRate
  });

  if (error) {
    // Determine if it's a unique constraint violation on slug
    if (error.code === '23505' && error.message.includes('slug')) {
      throw new Error('SlugUnavailable');
    }
    throw new Error(`Bootstrap failed: ${error.message}`);
  }

  if (!tenantId) {
    throw new Error('Bootstrap returned null tenant_id');
  }

  return tenantId as string;
}
