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
    // Return a mock user for testing if not signed in
    return {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'tester@kirkroberts.co.nz',
      app_metadata: { tenant_id: '00000000-0000-0000-0000-000000000001' },
      user_metadata: {}
    } as any;
  }

  return user;
}

export async function getOperationalContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If there's a real user logged in, use their real context
  if (user) {
    const tenantId = user.app_metadata?.tenant_id as string | undefined;
    if (!tenantId) {
      redirect('/onboarding');
    }
    return {
      userId: user.id,
      tenantId,
      email: user.email,
    };
  }

  // Fallback to the canonical Test Tenant seed from migration 001
  return {
    userId: '22222222-2222-2222-2222-222222222222', // Alice A from migration 001/007
    tenantId: '00000000-0000-0000-0000-000000000001', // Tenant A
    email: 'alice@kirkroberts.co.nz',
  };
}
