import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { calculateJobWip, WipSnapshot } from '@/lib/services/wip-engine';

type Db = SupabaseClient<Database>;

export interface ProfitabilitySnapshot {
  jobId: string;
  temporalDate?: string;
  realizedRevenue: number;
  unbilledWipValue: number;
  totalOperationalCost: number;
  profitMarginValue: number;
  profitMarginPercentage: number;
  wipSnapshot: WipSnapshot;
}

export async function calculateJobProfitability(
  db: Db, 
  jobId: string, 
  tenantId: string, 
  asOfDate?: string
): Promise<ProfitabilitySnapshot> {
  // 1. Get WIP and Revenue Snapshot from the WIP engine
  const wipSnapshot = await calculateJobWip(db, jobId, tenantId, asOfDate);

  // 2. Realized Revenue is Fee Value - Remaining Fee
  const realizedRevenue = wipSnapshot.jobFeeValue - wipSnapshot.remainingFeeBudget;

  // 3. Calculate Total Operational Cost
  // Total Cost MUST include all time entries (billed and unbilled, billable and non-billable)
  let query = db
    .from('time_entries')
    .select('hours, snapshot_cost_rate')
    .eq('tenant_id', tenantId)
    .eq('job_id', jobId)
    // IMPORTANT: Even DRAFT entries technically represent operational effort, 
    // but in strict financial reporting we usually only count APPROVED time as formal cost.
    // We will count APPROVED time entries for formal profitability to match WIP rules.
    .eq('status', 'APPROVED');

  if (asOfDate) {
    query = query.lte('operational_date', asOfDate);
  }

  const { data: entries, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch cost entries for profitability: ${error.message}`);
  }

  let totalOperationalCost = 0;
  (entries || []).forEach(entry => {
    // Both billable and non-billable time costs the business money!
    const cost = Number(entry.hours) * Number(entry.snapshot_cost_rate);
    totalOperationalCost += cost;
  });

  // 4. Calculate Final Margins
  // Formula: (Realized Revenue + Unbilled WIP) - Operational Cost = Profit
  const totalValue = realizedRevenue + wipSnapshot.unbilledWipValue;
  const profitMarginValue = totalValue - totalOperationalCost;
  
  let profitMarginPercentage = 0;
  if (totalValue > 0) {
    profitMarginPercentage = (profitMarginValue / totalValue) * 100;
  } else if (totalOperationalCost > 0) {
    // We spent money but have 0 revenue/WIP -> -100% margin
    profitMarginPercentage = -100;
  }

  return {
    jobId,
    temporalDate: asOfDate,
    realizedRevenue,
    unbilledWipValue: wipSnapshot.unbilledWipValue,
    totalOperationalCost,
    profitMarginValue,
    profitMarginPercentage,
    wipSnapshot
  };
}
