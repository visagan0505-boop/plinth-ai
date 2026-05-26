import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export class TenantConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantConfigurationError';
  }
}

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return user;
}

export async function getOperationalContext() {
  const user = await requireAuth();
  const tenantId = user.app_metadata?.tenant_id as string | undefined;

  if (!tenantId) {
    // If the user has no tenant ID, they must go through onboarding
    redirect('/onboarding');
  }

  return {
    userId: user.id,
    tenantId,
    email: user.email,
  };
}
