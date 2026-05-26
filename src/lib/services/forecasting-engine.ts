import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Db = SupabaseClient<Database>;

export interface FeeBurnForecast {
  jobId: string;
  currentWipVelocity: number; // Dollars of WIP added per week
  weeksUntilFeeDepletion: number;
  projectedDepletionDate: string | null;
  confidenceScore: number; // 0.0 to 1.0
}

export async function forecastJobFeeBurn(db: Db, jobId: string, tenantId: string): Promise<FeeBurnForecast> {
  // 1. Fetch the last 4 weekly snapshots to calculate velocity
  const { data: snapshots, error } = await db
    .from('job_analytical_snapshots')
    .select('temporal_date, unbilled_wip_value, total_operational_cost, profit_margin_value')
    .eq('job_id', jobId)
    .eq('tenant_id', tenantId)
    .order('temporal_date', { ascending: false })
    .limit(4);

  if (error || !snapshots || snapshots.length < 2) {
    // Cannot confidently forecast with less than 2 data points
    return {
      jobId,
      currentWipVelocity: 0,
      weeksUntilFeeDepletion: -1,
      projectedDepletionDate: null,
      confidenceScore: 0.1
    };
  }

  // Calculate velocity (difference in operational cost week over week)
  let totalDelta = 0;
  for (let i = 0; i < snapshots.length - 1; i++) {
    const currentCost = Number(snapshots[i].total_operational_cost);
    const previousCost = Number(snapshots[i+1].total_operational_cost);
    totalDelta += Math.max(0, currentCost - previousCost);
  }

  const averageWeeklyCostVelocity = totalDelta / (snapshots.length - 1);

  // Fetch the current remaining fee budget
  const { data: job } = await db.from('jobs').select('fee_value').eq('id', jobId).single();
  const feeValue = Number(job?.fee_value || 0);
  
  const currentTotalCost = Number(snapshots[0].total_operational_cost);
  const remainingBudget = Math.max(0, feeValue - currentTotalCost);

  let weeksUntilFeeDepletion = -1;
  let projectedDepletionDate = null;
  
  if (averageWeeklyCostVelocity > 0) {
    weeksUntilFeeDepletion = remainingBudget / averageWeeklyCostVelocity;
    
    // Calculate projected date
    const date = new Date(snapshots[0].temporal_date);
    date.setDate(date.getDate() + (weeksUntilFeeDepletion * 7));
    projectedDepletionDate = date.toISOString().split('T')[0];
  }

  // Confidence is heavily penalised if we have fewer than 4 data points
  let confidenceScore = snapshots.length === 4 ? 0.8 : 0.4;
  if (averageWeeklyCostVelocity === 0) confidenceScore = 0.1; // Stagnant

  return {
    jobId,
    currentWipVelocity: averageWeeklyCostVelocity,
    weeksUntilFeeDepletion,
    projectedDepletionDate,
    confidenceScore
  };
}
