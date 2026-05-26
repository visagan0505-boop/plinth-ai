import { createAdminClient } from '@/lib/supabase/admin';

export async function injectTenantClaim(userId: string, tenantId: string) {
  const adminAuth = createAdminClient().auth.admin;
  
  // Retrieve existing user
  const { data: userResponse, error: fetchError } = await adminAuth.getUserById(userId);
  if (fetchError || !userResponse.user) {
    throw new Error('Failed to retrieve user for claim injection');
  }

  // Update app_metadata
  const existingMetadata = userResponse.user.app_metadata || {};
  const { error: updateError } = await adminAuth.updateUserById(userId, {
    app_metadata: {
      ...existingMetadata,
      tenant_id: tenantId,
    }
  });

  if (updateError) {
    throw new Error(`Failed to inject tenant claim: ${updateError.message}`);
  }

  return true;
}
