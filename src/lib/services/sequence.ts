import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Db = SupabaseClient<Database>;

export async function generateJobNumber(db: Db, tenantId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  const { data, error } = await db.rpc('generate_next_sequence', {
    p_tenant_id: tenantId,
    p_entity_type: 'JOB',
    p_year: currentYear
  });

  if (error || !data) {
    throw new Error(`Failed to generate job number: ${error?.message}`);
  }

  return data;
}

export async function generateInvoiceNumber(db: Db, tenantId: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  const { data, error } = await db.rpc('generate_next_sequence', {
    p_tenant_id: tenantId,
    p_entity_type: 'INVOICE',
    p_year: currentYear
  });

  if (error || !data) {
    throw new Error(`Failed to generate invoice number: ${error?.message}`);
  }

  // Prepend INV- to the generated format
  return `INV-${data}`;
}
