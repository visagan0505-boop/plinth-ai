'use server';

import { TenantOnboardingSchema, OnboardingResult, TenantOnboardingDTO } from '@/lib/dtos/onboarding';
import { executeTenantBootstrap } from '@/lib/services/onboarding';
import { injectTenantClaim } from '@/lib/auth/jwt';
import { requireAuth } from '@/lib/auth/session';

export async function submitTenantOnboarding(
  formData: TenantOnboardingDTO
): Promise<OnboardingResult> {
  try {
    // 1. Ensure caller is authenticated
    const user = await requireAuth();

    // 2. Idempotency Check: Are they already onboarded?
    if (user.app_metadata?.tenant_id) {
      return { success: false, error: 'AlreadyOnboarded' };
    }

    // 3. Payload Validation
    const parsed = TenantOnboardingSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'ValidationFailed', details: parsed.error };
    }

    const dto = parsed.data;
    const email = user.email!;

    // 4. Transaction Execution
    let tenantId: string;
    try {
      tenantId = await executeTenantBootstrap(user.id, email, dto);
    } catch (err: any) {
      if (err.message === 'SlugUnavailable') {
        return { success: false, error: 'SlugUnavailable' };
      }
      return { success: false, error: 'DatabaseError', message: err.message };
    }

    // 5. JWT Propagation
    try {
      await injectTenantClaim(user.id, tenantId);
    } catch (err: any) {
      // Partial Failure Recovery: The DB transaction succeeded but Auth update failed.
      // We log this as a critical sync error to be handled by background workers.
      console.error('PARTIAL FAILURE: Tenant created but JWT claim failed.', err);
      return { success: false, error: 'DatabaseError', message: 'Tenant created but session sync failed.' };
    }

    return { success: true, tenantId };

  } catch (err: any) {
    return { success: false, error: 'DatabaseError', message: err.message || 'Unknown error' };
  }
}
