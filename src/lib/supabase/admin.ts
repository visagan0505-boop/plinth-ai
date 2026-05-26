import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { env } from '@/lib/env';

// DANGEROUS: BYPASSES RLS. Use ONLY in internal secure contexts.
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
  }
  
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
