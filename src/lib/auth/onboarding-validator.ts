import { createAdminClient } from '@/lib/supabase/admin';

export type OnboardingIntegrityResult = 
  | { isHealthy: true }
  | { isHealthy: false; missing: string[] };

/**
 * Validates that the operational bootstrap was completely successful.
 * Ensures the tenant, office, discipline, and staff records exist.
 */
export async function validateOnboardingIntegrity(tenantId: string, userId: string): Promise<OnboardingIntegrityResult> {
  const adminDb = createAdminClient();
  const missing: string[] = [];

  const [
    { count: tenantCount },
    { count: officeCount },
    { count: disciplineCount },
    { count: staffCount }
  ] = await Promise.all([
    adminDb.from('tenants').select('*', { count: 'exact', head: true }).eq('id', tenantId),
    adminDb.from('office_locations').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    adminDb.from('disciplines').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    adminDb.from('staff').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('auth_user_id', userId),
  ]);

  if (tenantCount !== 1) missing.push('tenant');
  if (officeCount === 0) missing.push('office_locations');
  if (disciplineCount === 0) missing.push('disciplines');
  if (staffCount !== 1) missing.push('staff');

  if (missing.length > 0) {
    return { isHealthy: false, missing };
  }

  return { isHealthy: true };
}
