import { createAdminClient } from '@/lib/supabase/admin';
import { injectTenantClaim } from '@/lib/auth/jwt';

/**
 * Recovers a partial failure state where a tenant was created in the database,
 * but the Supabase Auth JWT claim was not injected due to a network drop.
 */
export async function recoverTenantSession(userId: string): Promise<string | null> {
  const adminDb = createAdminClient();

  // 1. Check if the user already has a staff record
  const { data: staffRecord, error } = await adminDb
    .from('staff')
    .select('tenant_id')
    .eq('auth_user_id', userId)
    .single();

  if (error || !staffRecord) {
    // User is genuinely not onboarded
    return null;
  }

  // 2. We found a stranded tenant_id. Re-inject it.
  const tenantId = staffRecord.tenant_id;
  await injectTenantClaim(userId, tenantId);

  return tenantId;
}
