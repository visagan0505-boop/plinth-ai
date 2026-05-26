import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { calculateJobProfitability } from '@/lib/services/profitability';

type Db = SupabaseClient<Database>;

export async function snapshotJobAnalytics(db: Db, jobId: string, tenantId: string, asOfDate: string): Promise<void> {
  const profit = await calculateJobProfitability(db, jobId, tenantId, asOfDate);

  const { error } = await db
    .from('job_analytical_snapshots')
    .upsert({
      tenant_id: tenantId,
      job_id: jobId,
      temporal_date: asOfDate,
      total_approved_hours: profit.wipSnapshot.totalApprovedHours,
      unbilled_wip_value: profit.unbilledWipValue,
      realized_revenue: profit.realizedRevenue,
      total_operational_cost: profit.totalOperationalCost,
      profit_margin_value: profit.profitMarginValue,
      profit_margin_percentage: profit.profitMarginPercentage
    }, {
      onConflict: 'tenant_id, job_id, temporal_date'
    });

  if (error) {
    throw new Error(`Failed to snapshot job analytics: ${error.message}`);
  }
}

export async function processDomainEventForAnalytics(db: Db, eventId: string): Promise<void> {
  // In a real robust system, this reads the cursor, gets the event, 
  // processes it, and updates the cursor.
  // For the operational foundation, we will implement deterministic rebuilding for a job.
  
  const { data: event, error } = await db
    .from('domain_events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error || !event) return;

  // We are append-only. If a time entry or invoice happens today, snapshot today.
  // In a real pipeline, we'd snapshot the end of the current week.
  const today = new Date().toISOString().split('T')[0];

  if (event.entity_type === 'invoice' || event.entity_type === 'time_entry') {
    const payload = event.payload as any;
    const jobId = payload.job_id; // assuming payload carries job_id
    
    if (jobId) {
      await snapshotJobAnalytics(db, jobId, event.tenant_id, today);
    }
  }
}
