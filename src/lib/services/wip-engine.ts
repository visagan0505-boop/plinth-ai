import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Db = SupabaseClient<Database>;
// Using any as the schema isn't yet compiled with the new time_entries table
type TimeEntryRow = any;
type JobRow = Database['public']['Tables']['jobs']['Row'];

export interface WipSnapshot {
  jobId: string;
  totalApprovedHours: number;
  totalUnbilledHours: number;
  unbilledWipValue: number;
  totalWipValue: number; // Includes already billed time for historical context
  jobFeeValue: number;
  remainingFeeBudget: number;
}

export async function calculateJobWip(db: Db, jobId: string, tenantId: string, asOfDate?: string): Promise<WipSnapshot> {
  // 1. Fetch Job for Fee Value
  const { data: job, error: jobError } = await db
    .from('jobs')
    .select('fee_value')
    .eq('id', jobId)
    .eq('tenant_id', tenantId)
    .single();

  if (jobError || !job) {
    throw new Error(`Failed to fetch job fee value: ${jobError?.message}`);
  }

  // 2. Fetch Time Entries
  let query = db
    .from('time_entries')
    .select('hours, snapshot_bill_rate, is_billable, linked_invoice_id, operational_date')
    .eq('tenant_id', tenantId)
    .eq('job_id', jobId)
    .eq('status', 'APPROVED');

  if (asOfDate) {
    query = query.lte('operational_date', asOfDate);
  }

  const { data: entries, error: entriesError } = await query;

  if (entriesError) {
    throw new Error(`Failed to fetch time entries for WIP: ${entriesError.message}`);
  }

  let totalApprovedHours = 0;
  let totalUnbilledHours = 0;
  let unbilledWipValue = 0;
  let totalWipValue = 0;

  // 3. We also need to know if the linked invoice was issued before the asOfDate.
  // For standard real-time WIP (no asOfDate), any linked_invoice_id means it's billed.
  // For historical WIP, we'd need to join invoices. To keep it performant and simple for now:
  let invoicedIdsToExclude = new Set<string>();
  
  if (asOfDate) {
    const linkedInvoiceIds = [...new Set((entries || []).map(e => e.linked_invoice_id).filter(Boolean))];
    if (linkedInvoiceIds.length > 0) {
      const { data: invoices } = await db
        .from('invoices')
        .select('id, issued_at')
        .eq('tenant_id', tenantId)
        .in('id', linkedInvoiceIds as string[]);
      
      invoices?.forEach(inv => {
        // If the invoice was issued ON OR BEFORE our temporal boundary, it was already billed at that time.
        // Otherwise, it was NOT billed yet at that time.
        if (inv.issued_at && new Date(inv.issued_at) <= new Date(asOfDate)) {
          invoicedIdsToExclude.add(inv.id);
        }
      });
    }
  }

  (entries || []).forEach(entry => {
    const hours = Number(entry.hours);
    const billRate = Number(entry.snapshot_bill_rate);
    const isBillable = entry.is_billable;
    
    // Total hours logic
    totalApprovedHours += hours;
    
    // Value logic (only billable time contributes to WIP value)
    const value = isBillable ? (hours * billRate) : 0;
    totalWipValue += value;

    // Is it unbilled at this temporal boundary?
    let isBilled = false;
    if (entry.linked_invoice_id) {
      if (asOfDate) {
        isBilled = invoicedIdsToExclude.has(entry.linked_invoice_id);
      } else {
        isBilled = true;
      }
    }

    if (!isBilled) {
      totalUnbilledHours += hours;
      unbilledWipValue += value;
    }
  });

  // Fetch realized revenue for remaining fee calculation
  let revenueQuery = db
    .from('invoices')
    .select('total_amount, issued_at')
    .eq('tenant_id', tenantId)
    .eq('job_id', jobId)
    .in('status', ['ISSUED', 'PAID']);
    
  if (asOfDate) {
    revenueQuery = revenueQuery.lte('issued_at', asOfDate);
  }

  const { data: invoices } = await revenueQuery;
  const realizedRevenue = (invoices || []).reduce((acc, inv) => acc + Number(inv.total_amount), 0);
  
  const jobFeeValue = Number(job.fee_value);
  const remainingFeeBudget = jobFeeValue - realizedRevenue;

  return {
    jobId,
    totalApprovedHours,
    totalUnbilledHours,
    unbilledWipValue,
    totalWipValue,
    jobFeeValue,
    remainingFeeBudget
  };
}
