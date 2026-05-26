import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Db = SupabaseClient<Database>;

export async function listJobInvoices(db: Db, jobId: string, tenantId: string): Promise<any[]> {
  const { data, error } = await db
    .from('invoices')
    .select(`
      id,
      invoice_number,
      status,
      total_amount,
      issued_at,
      created_at
    `)
    .eq('job_id', jobId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list invoices: ${error.message}`);
  }

  return data;
}
